// ============================================================
// TYPES — Generated from Step 0 backend audit (verified DTOs)
// Gateway: http://localhost:8088
// ============================================================

// ---- AUTH ----

/** POST /api/auth/login — request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /api/auth/login — response body (JwtResponse.java) */
export interface JwtResponse {
  token: string;
  type: 'Bearer';
  id: number;
  username: string;
  email: string;
  roles: string[];
}

/** POST /api/auth/register & /api/users/register — request body (CreateUser.java) */
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  /** Field name: contactNumber (verified in CreateUser.java) */
  contactNumber: string;
  emailId: string;
  password: string;
}

/** Generic backend response (Response.java) */
export interface BackendResponse {
  responseCode: string;
  responseMessage: string;
}

// ---- USER ----

/** UserProfileDto.java — NOTE: field is "martialStatus" (typo in backend, kept as-is) */
export interface UserProfileDto {
  firstName: string;
  lastName: string;
  gender?: string;
  address?: string;
  occupation?: string;
  /** NOTE: This is the actual field name from UserProfileDto.java — backend typo for "maritalStatus" */
  martialStatus?: string;
  nationality?: string;
}

/** UserDto.java */
export interface UserDto {
  userId: number;
  emailId: string;
  password?: string;
  identificationNumber: string;
  authId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  userProfileDto: UserProfileDto;
}

/**
 * PUT /api/users/{id} — request body (UserUpdate.java)
 * NOTE: contactNo (not contactNumber) — different from CreateUser
 */
export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  /** Field is "contactNo" in UserUpdate.java (different from contactNumber in CreateUser.java) */
  contactNo?: string;
  address?: string;
  gender?: string;
  occupation?: string;
  /** Same backend typo */
  martialStatus?: string;
  nationality?: string;
}

// ---- ACCOUNT ----

/**
 * AccountDto.java — note: accountType and accountStatus are strings in the DTO,
 * not enums (enum class exists but DTO uses String)
 */
export interface AccountDto {
  accountId?: number;
  accountNumber?: string;
  accountType: string; // 'SAVINGS' | 'CURRENT' | 'LOAN'
  accountStatus?: string; // 'ACTIVE' | 'INACTIVE' | 'CLOSED'
  availableBalance: number;
  userId: number;
}

// ---- TRANSACTION ----

/** POST /transactions — request body (TransactionDto.java) */
export interface TransactionDto {
  accountId: string;
  transactionType: string; // 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT'
  amount: number;
  description: string;
}

/** GET /transactions response item (TransactionRequest.java — confusingly named) */
export interface TransactionRecord {
  referenceId: string;
  accountId: string;
  transactionType: string;
  amount: number;
  /** LocalDateTime serialized — typically ISO string array [y,m,d,H,M,S] or string */
  localDateTime: string | number[];
  transactionStatus: string; // 'PENDING' | 'COMPLETED' | 'FAILED'
  comments?: string;
}

// ---- FUND TRANSFER ----

/** POST /fund-transfers — request body (FundTransferRequest.java) */
export interface FundTransferRequest {
  fromAccount: string;
  toAccount: string;
  amount: number;
}

/** POST /fund-transfers — response body (FundTransferResponse.java) */
export interface FundTransferResponse {
  transactionId: string;
  message: string;
}

/** GET /fund-transfers/{ref} and GET /fund-transfers?accountId= (FundTransferDto.java) */
export interface FundTransferDto {
  transactionReference: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  status: string; // 'PENDING' | 'COMPLETED' | 'FAILED'
  transferType: string;
  transferredOn: string | number[];
}

// ---- ERRORS ----

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

// ---- UI TYPES ----

export type Theme = 'light' | 'dark';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'transfer' | 'account' | 'system';
}

export type AuthMode = 'LOCAL_JWT' | 'OAUTH2';
