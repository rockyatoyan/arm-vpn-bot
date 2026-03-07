import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateUserResponse } from './api.types';

@Injectable()
export class ApiService {
  apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.getOrThrow<string>('VPN_API_URL');
  }

  async createUser(telegramId: number | string, chatId: number) {
    const username = isNaN(Number(telegramId))
      ? telegramId
      : `tg_${telegramId}`;

    const payload = {
      username,
      status: 'on_hold',
      expire: null,
      on_hold_expire_duration: this.getOnHoldExpire(),
      note: String(chatId),
      proxies: {
        vless: {
          flow: 'xtls-rprx-vision',
        },
        // trojan: {},
      },
      inbounds: {
        vless: ['VLESS TCP REALITY'],
        // trojan: ['TROJAN TCP TLS'],
      },
    };

    const { data } = await firstValueFrom(
      this.httpService
        .post<CreateUserResponse>(this.apiUrl + '/user', payload, {
          headers: await this.getHeaders(),
        })
        .pipe(
          catchError((error) => {
            throw new BadRequestException(
              `Failed to create user: ${error.response?.data?.message || error.message}`,
            );
          }),
        ),
    );

    return data;
  }

  async renewUserSubscription(user: CreateUserResponse) {
    const status = user.status;

    if (status === 'active') {
      const currentExpire = user.expire;

      const date = new Date(currentExpire * 1000);

      date.setMonth(date.getMonth() + 1);

      const newExpire = Math.floor(date.getTime() / 1000);

      const payload = {
        expire: newExpire,
      };

      const { data } = await firstValueFrom(
        this.httpService
          .put<CreateUserResponse>(
            this.apiUrl + '/user/' + user.username,
            payload,
            {
              headers: await this.getHeaders(),
            },
          )
          .pipe(
            catchError((error) => {
              throw new BadRequestException(
                `Failed to renew user subscription: ${error.response?.data?.message || error.message}`,
              );
            }),
          ),
      );

      return data;
    }

    if (status === 'on_hold') {
      const onHoldExpire = user.on_hold_expire_duration;

      const payload = {
        status: 'on_hold',
        expire: null,
        on_hold_expire_duration: onHoldExpire + this.getOnHoldExpire(),
      };

      const { data } = await firstValueFrom(
        this.httpService
          .put<CreateUserResponse>(
            this.apiUrl + '/user/' + user.username,
            payload,
            {
              headers: await this.getHeaders(),
            },
          )
          .pipe(
            catchError((error) => {
              console.log(error);
              throw new BadRequestException(
                `Failed to renew user subscription: ${error.response?.data?.message || error.message}`,
              );
            }),
          ),
      );

      return data;
    }

    if (status === 'expired') {
      const payload = {
        status: 'on_hold',
        expire: null,
        on_hold_expire_duration: this.getOnHoldExpire(),
      };

      const { data } = await firstValueFrom(
        this.httpService
          .put<CreateUserResponse>(
            this.apiUrl + '/user/' + user.username,
            payload,
            {
              headers: await this.getHeaders(),
            },
          )
          .pipe(
            catchError((error) => {
              throw new BadRequestException(
                `Failed to renew user subscription: ${error.response?.data?.message || error.message}`,
              );
            }),
          ),
      );

      return data;
    }

    return null;
  }

  async getUser(telegramId: number | string) {
    const username = isNaN(Number(telegramId))
      ? telegramId
      : `tg_${telegramId}`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<CreateUserResponse>(
          this.apiUrl + '/user/' + username,
          {
            headers: await this.getHeaders(),
          },
        ),
      );

      return data;
    } catch {
      return null;
    }
  }

  private async getHeaders() {
    const token = await this.getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private async getAuthToken() {
    try {
      const username =
        this.configService.getOrThrow<string>('VPN_API_USERNAME');
      const password =
        this.configService.getOrThrow<string>('VPN_API_PASSWORD');

      const { data } = await firstValueFrom(
        this.httpService.post<{ access_token: string }>(
          this.apiUrl + '/admin/token',
          {
            username,
            password,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      return data.access_token;
    } catch (error) {
      throw new UnauthorizedException(
        'Failed to retrieve API Admin credentials',
      );
    }
  }

  private getOnHoldExpire() {
    return 60 * 60 * 24 * 31;
  }
}
