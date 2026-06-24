import apiClient from "./http";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "../types/index";

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function getMe(): Promise<AuthResponse> {
  const { data } = await apiClient.get<AuthResponse>("/auth/me");
  return data;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post("/auth/logout");
}
