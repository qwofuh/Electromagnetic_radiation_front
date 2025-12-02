/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsDevice {
  avgMaxPower?: number;
  avgMinPower?: number;
  id?: number;
  image?: string;
  maxRadiationZone?: string;
  maxSafeRange?: number;
  minSafeRange?: number;
  radiationSource?: string;
  radiationType?: string;
  title?: string;
  visability?: boolean;
}

export interface DsEmissionCompleteRequest {
  moderator_id: number;
  status: "завершен" | "отклонен";
}

export interface DsEmissionListResponse {
  orders?: DsEmissionResponse[];
  /** @example "success" */
  status?: string;
}

export interface DsEmissionResponse {
  create_at?: string;
  distance?: number;
  finish_at?: string;
  id?: number;
  status?: string;
  total_emission?: number;
  update_at?: string;
}

export interface DsEmissionUpdateRequest {
  distance?: number;
}

export interface DsErrorResponse {
  /** @example "Некорректный токен" */
  error?: string;
}

export interface DsLoginReq {
  login?: string;
  password?: string;
}

export interface DsLoginResponse {
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" */
  access_token?: string;
  /**
   * время жизни токена (в секундах)
   * @example 3600
   */
  expires_in?: number;
  /** @example "Bearer" */
  token_type?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8080",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Device emission Service API
 * @version 1.0
 * @baseUrl http://localhost:8080
 * @contact
 *
 * API сервиса аутентификации с Redis и JWT. Поддерживает роли пользователей и администраторов.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Создает новое устройство с указанными параметрами. Доступно только администраторам
     *
     * @tags Устройства
     * @name DeviceCreate
     * @summary Создать новое устройство
     * @request POST:/api/device
     * @secure
     */
    deviceCreate: (request: DsDevice, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/device`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает информацию об устройстве по его идентификатору
     *
     * @tags Устройства
     * @name DeviceIdList
     * @summary Получить устройство по ID
     * @request GET:/api/device/:id
     */
    deviceIdList: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/device/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные существующего устройства по его ID. Доступно только администраторам
     *
     * @tags Устройства
     * @name DeviceIdUpdate
     * @summary Обновить устройство
     * @request PUT:/api/device/:id
     * @secure
     */
    deviceIdUpdate: (
      id: number,
      request: DsDevice,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/device/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Помечает устройство как скрытое (soft delete). Доступно только администраторам
     *
     * @tags Устройства
     * @name DeviceIdDeleteCreate
     * @summary Удалить устройство
     * @request POST:/api/device/:id/delete
     * @secure
     */
    deviceIdDeleteCreate: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/api/device/${id}/delete`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Загружает или заменяет изображение для устройства. Доступно только администраторам
     *
     * @tags Устройства
     * @name DeviceIdImageCreate
     * @summary Загрузить изображение устройства
     * @request POST:/api/device/:id/image
     * @secure
     */
    deviceIdImageCreate: (
      id: number,
      data: {
        /** Изображение устройства */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/api/device/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает список всех устройств с возможностью фильтрации по названию
     *
     * @tags Устройства
     * @name DevicesList
     * @summary Получить список устройств
     * @request GET:/api/devices
     */
    devicesList: (
      query?: {
        /** Фильтр по названию устройства */
        title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/devices`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает список заказов с возможностью фильтрации по статусу и диапазону дат. Разрешённые статусы: "сформирован", "завершен", "отклонен".
     *
     * @tags Заявки с устройствами
     * @name EmissionsCalculationList
     * @summary Получить список заказов
     * @request GET:/api/emissions_calculation
     * @secure
     */
    emissionsCalculationList: (
      query?: {
        /** Статус заказа (сформирован, завершен, отклонен), можно указать несколько через запятую */
        status?: string;
        /** Дата начала фильтрации (формат YYYY-MM-DD) */
        start?: string;
        /** Дата окончания фильтрации (формат YYYY-MM-DD) */
        end?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsEmissionListResponse, DsErrorResponse>({
        path: `/api/emissions_calculation`,
        method: "GET",
        query: query,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает полную информацию о заказе с расчетом выбросов, включая список устройств. Доступен только владельцу заказа или администратору
     *
     * @tags Заявки с устройствами
     * @name EmissionsCalculationIdList
     * @summary Получить заказ с устройствами
     * @request GET:/api/emissions_calculation/:id
     * @secure
     */
    emissionsCalculationIdList: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/emissions_calculation/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет параметры заказа (например, расстояние). Разрешено обновлять только поле distance
     *
     * @tags Заявки с устройствами
     * @name EmissionsCalculationIdUpdate
     * @summary Обновить заказ
     * @request PUT:/api/emissions_calculation/:id
     * @secure
     */
    emissionsCalculationIdUpdate: (
      id: number,
      request: DsEmissionUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/emissions_calculation/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Переводит заказ в статус "завершен" или "отклонен". Доступно только администраторам
     *
     * @tags Заявки с устройствами
     * @name EmissionsCalculationIdCompleteUpdate
     * @summary Завершить или отклонить заказ
     * @request PUT:/api/emissions_calculation/:id/complete
     * @secure
     */
    emissionsCalculationIdCompleteUpdate: (
      id: number,
      request: DsEmissionCompleteRequest,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/emissions_calculation/${id}/complete`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Переводит черновой заказ в статус "сформирован". Требуется, чтобы все устройства имели заполненное поле custom_power
     *
     * @tags Заявки с устройствами
     * @name EmissionsCalculationIdFormUpdate
     * @summary Сформировать заказ
     * @request PUT:/api/emissions_calculation/:id/form
     * @secure
     */
    emissionsCalculationIdFormUpdate: (
      id: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/emissions_calculation/${id}/form`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет устройство из расчета выбросов по ID заказа и ID устройства
     *
     * @tags Заявки с устройствами
     * @name EmissionsCalculationOrderIdDeviceMaterialIdDelete
     * @summary Удалить устройство из заказа
     * @request DELETE:/api/emissions_calculation/:order_id/device/:material_id
     * @secure
     */
    emissionsCalculationOrderIdDeviceMaterialIdDelete: (
      orderId: number,
      materialId: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/emissions_calculation/${orderId}/device/${materialId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Помечает заказ как удаленный (soft delete), устанавливая статус "удален"
     *
     * @tags Заявки с устройствами
     * @name EmissionsCalculationDeleteIdCreate
     * @summary Удалить заказ
     * @request POST:/api/emissions_calculation/delete/:id
     * @secure
     */
    emissionsCalculationDeleteIdCreate: (
      id: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/emissions_calculation/delete/${id}`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет значение пользовательской мощности (custom_power) для устройства в заказе
     *
     * @tags Заявки с устройствами
     * @name EmissionsCalculationDevicesOrderIdMaterialIdCustomPowerUpdate
     * @summary Обновить пользовательскую мощность устройства
     * @request PUT:/api/emissions_calculation/devices/:order_id/:material_id/custom_power
     * @secure
     */
    emissionsCalculationDevicesOrderIdMaterialIdCustomPowerUpdate: (
      orderId: number,
      materialId: number,
      request: object,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/emissions_calculation/devices/${orderId}/${materialId}/custom_power`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет устройство в черновой заказ пользователя. Если чернового заказа нет, создает новый
     *
     * @tags Заявки с устройствами
     * @name EmissionsCalculationDraftAddIdCreate
     * @summary Добавить устройство в черновой заказ
     * @request POST:/api/emissions_calculation/draft/add/:id
     * @secure
     */
    emissionsCalculationDraftAddIdCreate: (
      id: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/emissions_calculation/draft/add/${id}`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает информацию о черновом заказе пользователя: ID заказа и количество устройств в нем
     *
     * @tags Заявки с устройствами
     * @name EmissionsCalculationDraftCartList
     * @summary Получить корзину чернового заказа
     * @request GET:/api/emissions_calculation/draft/cart
     * @secure
     */
    emissionsCalculationDraftCartList: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/emissions_calculation/draft/cart`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает информацию о пользователе по его ID (логин и роль)
     *
     * @tags Управление пользователями
     * @name UsersIdList
     * @summary Получить информацию о пользователе
     * @request GET:/api/users/:id
     * @secure
     */
    usersIdList: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/users/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет логин и/или пароль пользователя по его ID
     *
     * @tags Управление пользователями
     * @name UsersIdUpdate
     * @summary Обновить данные пользователя
     * @request PUT:/api/users/:id
     * @secure
     */
    usersIdUpdate: (id: number, request: object, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/api/users/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Авторизует пользователя по логину и паролю, возвращает JWT-токен и время жизни
     *
     * @tags auth
     * @name UsersLoginCreate
     * @summary Аутентификация пользователя
     * @request POST:/api/users/login
     */
    usersLoginCreate: (request: DsLoginReq, params: RequestParams = {}) =>
      this.request<DsLoginResponse, Record<string, string>>({
        path: `/api/users/login`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет JWT-токен в черный список (блеклист) Redis, чтобы он стал недействительным
     *
     * @tags auth
     * @name UsersLogoutCreate
     * @summary Деаутентификация пользователя
     * @request POST:/api/users/logout
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, DsErrorResponse>({
        path: `/api/users/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
}
