import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return {
    id: req.headers['x-user-id'],
    role: req.headers['x-user-role'],
    username: req.headers['x-user-username'],
  };
});
