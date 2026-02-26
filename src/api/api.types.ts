export interface CreateUserResponse {
  proxies: Record<string, any>;
  expire: number;
  data_limit: number;
  data_limit_reset_strategy: 'no_reset' | 'day' | 'week' | 'month' | 'year';
  inbounds: Record<string, string[]>;
  note: string;
  sub_updated_at: string;
  sub_last_user_agent: string;
  online_at: string;
  on_hold_expire_duration: number;
  on_hold_timeout: string;
  auto_delete_in_days: number;
  next_plan: {
    data_limit: number;
    expire: number;
    add_remaining_traffic: boolean;
    fire_on_either: boolean;
  };
  username: string;
  status: 'active' | 'disabled' | 'limited' | 'expired' | 'on_hold';
  used_traffic: number;
  lifetime_used_traffic: number;
  created_at: string;
  links: string[];
  subscription_url: string;
  excluded_inbounds: Record<string, string[]>;
  admin?: {
    username: string;
    is_sudo: boolean;
    telegram_id: number;
    discord_webhook: string;
    users_usage: number;
  };
}
