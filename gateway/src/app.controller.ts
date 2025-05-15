import { Controller, All, Req, Res, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  // 서버를 추가한다면, 이곳에
  private readonly routingTable: Record<string, string> = {
    auth: 'http://auth:3000',
    event: 'http://event:3000',
    // 예: user: 'http://user:3000'
  };

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const { method, originalUrl, body, headers } = req;

    // ex) 'auth', 'event' 엔트리포인트에서 추출
    const prefix = originalUrl.split('/')[1]; 
    const targetBaseUrl = this.routingTable[prefix];

    if (!targetBaseUrl) {
      return res.status(404).json({ message: 'Unknown route prefix' });
    }

    const forwardedUrl = originalUrl.replace(`/${prefix}`, ''); // /auth/ping → /ping
    const url = targetBaseUrl + (forwardedUrl || '/');

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: method as any,
          url,
          data: body,
          headers,
        }),
      );

      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[Gateway Error] ${method} ${originalUrl} → ${url}`, error?.message);
      return res
        .status(error.response?.status || 500)
        .json(error.response?.data || { message: 'Gateway error' });
    }
  }
}

// @Controller('ping')
// export class PingController {
//   @Get()
//   getPong() {
//     return { message: 'gateway 서버 접속' };
//   }
// }
