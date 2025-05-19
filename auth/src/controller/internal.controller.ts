import { Controller, Patch, Param, Headers, ForbiddenException, Body } from '@nestjs/common';
import { AuthService } from '../app.service';

@Controller('internal') // 내부용 prefix
export class InternalController {
  constructor(private readonly authService: AuthService) {}

  @Patch('/users/:userId/event-progress/:eventId/join')
    async joinUserToEvent(
        @Param('userId') userId: string,
        @Param('eventId') eventId: string,
        @Headers('x-internal-secret') secret: string,
        @Body() body: { type: string; conditions: Record<string, any> },
    ) {
    if (secret !== process.env.INTERNAL_SECRET) {
        throw new ForbiddenException('내부 API 접근 거부');
    }

    return this.authService.joinUserToEvent(
        userId,
        eventId, 
        body.type,
        body.conditions,
    );
    }
  @Patch('/users/:userId/event-progress/:eventId/reward')
    async markRewardReceived(
        @Param('userId') userId: string,
        @Param('eventId') eventId: string,
        @Headers('x-internal-secret') secret: string,
    ) {
        if (secret !== process.env.INTERNAL_SECRET) {
            throw new ForbiddenException('내부 API 접근 거부');
        }

        return this.authService.markRewardReceived(userId, eventId);
    }

}
