/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Interface of Create Pactt , using this interface it create a new pact in pact.service.ts */
export interface CreatePact {
  /** Name of the pact i.e the title, which is gotten in the pact form */
  name: string;
  /** Terms of the pact i.e the Description */
  terms: string;
  /**
   * Address of the pact on the blockchain
   * @maxLength 44
   */
  address: string;
  /**
   * Transaction hash of the pact on the blockchain
   * @maxLength 66
   */
  transactionHash: string;
  /** Block hash of the pact on the blockchain */
  blockHash?: string;
}

export interface Pact {
  id: number;
  name: string;
  terms: string;
  address: string;
  transactionHash: string;
  blockHash: string;
}

export type PactNullable = {
  id: number;
  name: string;
  terms: string;
  address: string;
  transactionHash: string;
  blockHash: string;
} | null;

export interface CreatePrizeDto {
  address: string;
  proposal_id: string;
}

export interface Prize {
  id: string;
  description: string;
  isAutomatic: boolean;
  submissionTime: number;
  votingTime: number;
  /** @format date-time */
  startVotingDate: string;
  /** @format date-time */
  startSubmissionDate: string;
  proposer_address: string;
  contract_address: string;
  admins: string[];
  proficiencies: string[];
  priorities: string[];
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  updated_at: string;
  images: string[];
  title: string;
  submissions: Submission[];
  user: User;
}

export interface Submission {
  id: string;
  submissionDescription: string;
  submissionHash: string;
  submitterAddress: string;
  user: User;
  prize: Prize;
}

export interface User {
  id: string;
  email: string;
  authId: string;
  name: string;
  username: string;
  isAdmin: boolean;
  submissions: Submission[];
  prizeProposals: PrizeProposals[];
  prizes: Prize[];
}

export interface PrizeProposals {
  id: string;
  voting_time: number;
  submission_time: number;
  admins: string[];
  /** The Columns here are not part of the smart contract */
  isApproved: boolean;
  isRejected: boolean;
  title: string;
  description: string;
  isAutomatic: boolean;
  /** @format date-time */
  startVotingDate: string;
  /** @format date-time */
  startSubmissionDate: string;
  proficiencies: string[];
  priorities: string[];
  images: string[];
  user: User;
}

/** Make all properties in T readonly */
export interface ReadonlyType {
  data: PrizeWithBalance[];
  hasNextPage: boolean;
}

export interface PrizeWithBalance {
  balance: number;
  id: string;
  description: string;
  isAutomatic: boolean;
  submissionTime: number;
  votingTime: number;
  /** @format date-time */
  startVotingDate: string;
  /** @format date-time */
  startSubmissionDate: string;
  proposer_address: string;
  contract_address: string;
  admins: string[];
  proficiencies: string[];
  priorities: string[];
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  updated_at: string;
  images: string[];
  title: string;
  submissions: Submission[];
  user: User;
}

export interface PrizeWithBlockchainData {
  submission_time_blockchain: number;
  voting_time_blockchain: number;
  balance: number;
  id: string;
  description: string;
  isAutomatic: boolean;
  submissionTime: number;
  votingTime: number;
  /** @format date-time */
  startVotingDate: string;
  /** @format date-time */
  startSubmissionDate: string;
  proposer_address: string;
  contract_address: string;
  admins: string[];
  proficiencies: string[];
  priorities: string[];
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  updated_at: string;
  images: string[];
  title: string;
  submissions: Submission[];
  user: User;
}

export interface CreateSubmissionDto {
  submissionDescription: string;
  submissionHash: string;
  submitterAddress: string;
}

export interface Http200Response {
  message: string;
}

/** Make all properties in T readonly */
export interface ReadonlyTypeO1 {
  data: SubmissionWithBlockchainData[];
  hasNextPage: boolean;
}

export interface SubmissionWithBlockchainData {
  voting_blockchain: number;
  id: string;
  submissionDescription: string;
  submissionHash: string;
  submitterAddress: string;
  user: User;
  prize: Prize;
}

/** Make all properties in T readonly */
export interface ReadonlyTypeO2 {
  data: PrizeProposals[];
  hasNextPage: boolean;
}

/** Make all properties in T readonly */
export interface ReadonlyTypeO3 {
  data: PrizeProposals[];
  hasNextPage: boolean;
}

export interface CreatePrizeProposalDto {
  voting_time: number;
  submission_time: number;
  admins: string[];
  title: string;
  description: string;
  proposer_address: string;
  isAutomatic: boolean;
  /** @format date-time */
  startVotingDate?: string;
  /** @format date-time */
  startSubmissionDate?: string;
  proficiencies: (
    | 'Programming'
    | 'Python'
    | 'JavaScript'
    | 'Writing'
    | 'Design'
    | 'Translation'
    | 'Research'
    | 'Real estate'
    | 'Apps'
    | 'Hardware'
    | 'Art'
    | 'Meta'
    | 'AI'
  )[];
  priorities: (
    | 'Climate change'
    | 'Network civilizations'
    | 'Open-source'
    | 'Community coordination'
    | 'Health'
    | 'Education'
  )[];
  images: string[];
}

/** Make all properties in T readonly */
export interface ReadonlyTypeO4 {
  data: PrizeProposals[];
  hasNextPage: boolean;
}

export interface RejectProposalDto {
  comment: string;
}

/** Interface of Create User , using this interface it create a new user in */
export interface CreateUser {
  /**
   * User's emails which will be used to send emails and futher communication
   * @format email
   */
  email: string;
  /**
   * User Id which is gotten from the auth provider like privy , torus etc...
   * @minLength 5
   */
  authId: string;
  /** The user name which is gotten from the onboarding process or page */
  name: string;
  /** The username which is gotten from the onboarding process or page and it is unique */
  username: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = 'https://api.pactsmith.com/api';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(
      typeof value === 'number' ? value : `${value}`,
    )}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
        },
        signal:
          (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) ||
          null,
        body:
          typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title nestjs-boilerplate
 * @version 0.0.1
 * @license UNLICENSED
 * @baseUrl http://localhost:3001/api
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  pacts = {
    /**
     * No description
     *
     * @name PactsCreate
     * @request POST:/pacts
     */
    pactsCreate: (data: CreatePact, params: RequestParams = {}) =>
      this.request<Pact, any>({
        path: `/pacts`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @name PactsDetail
     * @request GET:/pacts/{address}
     */
    pactsDetail: (address: string, params: RequestParams = {}) =>
      this.request<PactNullable, any>({
        path: `/pacts/${address}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
  prizes = {
    /**
     * No description
     *
     * @name PrizesCreate
     * @request POST:/prizes
     */
    prizesCreate: (data: CreatePrizeDto, params: RequestParams = {}) =>
      this.request<Prize, any>({
        path: `/prizes`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description The code snippet you provided is a method in the `PrizesController` class. It is a route handler for the GET request to `/prizes` endpoint. Here's a breakdown of what it does: Gets page
     *
     * @name PrizesList
     * @summary Get all Prizes
     * @request GET:/prizes
     */
    prizesList: (
      query: {
        page: number;
        limit: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ReadonlyType, any>({
        path: `/prizes`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @name PrizesDetail
     * @request GET:/prizes/{id}
     */
    prizesDetail: (id: string, params: RequestParams = {}) =>
      this.request<PrizeWithBlockchainData, any>({
        path: `/prizes/${id}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @name SubmissionCreate
     * @request POST:/prizes/{id}/submission
     */
    submissionCreate: (
      id: string,
      data: CreateSubmissionDto,
      params: RequestParams = {},
    ) =>
      this.request<Http200Response, any>({
        path: `/prizes/${id}/submission`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @name SubmissionDetail
     * @request GET:/prizes/{id}/submission
     */
    submissionDetail: (
      id: string,
      query: {
        page: number;
        limit: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ReadonlyTypeO1, any>({
        path: `/prizes/${id}/submission`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description The code snippet you provided is a method in the `PrizesController` class. It is a route handler for the GET request to `/proposals` endpoint. Here's a breakdown of what it does: Gets page
     *
     * @name ProposalsList
     * @summary Get all Pending proposals
     * @request GET:/prizes/proposals
     * @secure
     */
    proposalsList: (
      query: {
        page: number;
        limit: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ReadonlyTypeO2, any>({
        path: `/prizes/proposals`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description The code snippet you provided is a method in the `PrizesController` class. It is a route handler for the POST request to `/proposals` endpoint. Here's a breakdown of what it does:
     *
     * @name ProposalsCreate
     * @summary Create a new proposal using user auth token to know which user is calling this function and sends email to user
     * @request POST:/prizes/proposals
     * @secure
     */
    proposalsCreate: (data: CreatePrizeProposalDto, params: RequestParams = {}) =>
      this.request<PrizeProposals, any>({
        path: `/prizes/proposals`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
 * @description The code snippet you provided is a method in the `PrizesController` class. It is a route handler for the GET request to `/proposals/accept` endpoint. Here's a breakdown of what it does: Gets page
 *
 * @name ProposalsAcceptList
 * @summary Retrieve a list of accepted prize proposals
description: Retrieve a list of accepted prize proposals. The list supports pagination.
parameters
 * @request GET:/prizes/proposals/accept
 * @secure
 */
    proposalsAcceptList: (
      query: {
        page: number;
        limit: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ReadonlyTypeO3, any>({
        path: `/prizes/proposals/accept`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get all proposals  of user  by username
     *
     * @name ProposalsUserDetail
     * @summary Get all proposals of users by username,
     * @request GET:/prizes/proposals/user/{username}
     */
    proposalsUserDetail: (
      username: string,
      query: {
        page: number;
        limit: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ReadonlyTypeO4, any>({
        path: `/prizes/proposals/user/${username}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Admin Reject proposal
     *
     * @name ProposalsRejectCreate
     * @summary Reject Proposal,
     * @request POST:/prizes/proposals/reject/{id}
     * @secure
     */
    proposalsRejectCreate: (
      id: string,
      data: RejectProposalDto,
      params: RequestParams = {},
    ) =>
      this.request<Http200Response, any>({
        path: `/prizes/proposals/reject/${id}`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
 * @description The function `approveProposal` is an asynchronous function that takes an `id` parameter and calls the `approve` method of the `prizeProposalsService` with the given `id`. and it approves the proposal and sends an email of approval
 *
 * @name ProposalsAcceptCreate
 * @summary The function `approveProposal` is an asynchronous function that takes an `id` parameter and calls
the `approve` method of the `prizeProposalsService` with the given `id`
 * @request POST:/prizes/proposals/accept/{id}
 * @secure
 */
    proposalsAcceptCreate: (id: string, params: RequestParams = {}) =>
      this.request<Http200Response, any>({
        path: `/prizes/proposals/accept/${id}`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  users = {
    /**
     * @description Creates a new user and sends welcome email.
     *
     * @name UsersCreate
     * @summary Creates a new user and sends welcome email
     * @request POST:/users
     */
    usersCreate: (data: CreateUser, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/users`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a user by ID.
     *
     * @name UsersDetail
     * @summary Get a user by ID
     * @request GET:/users/{authId}
     */
    usersDetail: (authId: string, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/users/${authId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a user by username.
     *
     * @name UsernameDetail
     * @summary Get a user by username
     * @request GET:/users/username/{username}
     */
    usernameDetail: (username: string, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/users/username/${username}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Endpoint for checking if a user with the specified username exists.
     *
     * @name ExistsDetail
     * @summary Endpoint for checking if a user with the specified username exists
     * @request GET:/users/exists/{username}
     */
    existsDetail: (username: string, params: RequestParams = {}) =>
      this.request<boolean, any>({
        path: `/users/exists/${username}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
}
