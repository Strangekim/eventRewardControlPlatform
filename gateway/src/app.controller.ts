import { Controller, All, Req, Res, Get, HttpException,HttpStatus,UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from './auth/optional-jwt-auth-guard';

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  // 서버를 추가한다면, 이곳에
  private readonly routingTable: Record<string, string> = {
    auth: 'http://auth:3000',
    event: 'http://event:3000',
  };

  @UseGuards(OptionalJwtAuthGuard)
  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const { method, originalUrl, body, headers } = req;
    const user = (req as any).user;

    const prefix = originalUrl.split('/')[1];
    const targetBaseUrl = this.routingTable[prefix];
    if (!targetBaseUrl) {
      throw new HttpException('엔트리 포인트가 잘못되었습니다', HttpStatus.NOT_FOUND);
    }

    const forwardedUrl = originalUrl.replace(`/${prefix}`, '') || '/';
    const url = targetBaseUrl + forwardedUrl;

    const { 'content-length': _, ...safeHeaders } = headers;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: method as any,
          url,
          data: body,
          headers: {
            ...safeHeaders,
            'Content-Type': 'application/json',
            'x-user-id': user?.id || '',
            'x-user-role': user?.role || '',
            'x-user-username': user?.username || '',
          },
        }),
      );

      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[Gateway Error] ${method} ${originalUrl} → ${url}`, error?.message);
      return res
        .status(error.response?.status || 500)
        .json(error.response?.data || { message: '게이트웨이 서버 에러' });
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
