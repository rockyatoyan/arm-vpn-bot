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

  async createUser(telegramId: number | string) {
    const username = isNaN(Number(telegramId))
      ? telegramId
      : `tg_${telegramId}`;

    const payload = {
      username,
      expire: 0,
      proxies: {
        vless: {
          flow: 'xtls-rprx-vision',
        },
        trojan: {},
      },
      inbounds: {
        vless: ['VLESS TCP REALITY'],
        trojan: ['TROJAN TCP TLS'],
      },
    };

    const { data } = await firstValueFrom(
      this.httpService
        .post<CreateUserResponse>(this.apiUrl + '/user	', payload, {
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
      console.log(error);
      throw new UnauthorizedException(
        'Failed to retrieve API Admin credentials',
      );
    }
  }
}
