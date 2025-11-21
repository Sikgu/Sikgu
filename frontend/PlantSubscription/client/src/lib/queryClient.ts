// // import { QueryClient, QueryFunction } from "@tanstack/react-query";
// //
// // async function throwIfResNotOk(res: Response) {
// //   if (!res.ok) {
// //     const text = (await res.text()) || res.statusText;
// //
// //     try {
// //       const errorData = JSON.parse(text);
// //
// //       if (errorData.error === "insufficient_coins") {
// //         throw {
// //           error: "insufficient_coins",
// //           currentCoins: errorData.currentCoins,
// //           requiredCoins: errorData.requiredCoins,
// //           message: "보유 코인이 부족합니다."
// //         };
// //       }
// //
// //       const errorMessage = errorData.error || errorData.message || text;
// //       throw new Error(errorMessage);
// //     } catch (e) {
// //       if (e instanceof Error && e.message) {
// //         throw e;
// //       }
// //       if (typeof e === 'object' && e !== null && 'error' in e) {
// //         throw e;
// //       }
// //
// //       if (res.status === 400) {
// //         throw new Error("요청을 처리할 수 없습니다. 입력 내용을 확인해주세요.");
// //       } else if (res.status === 401) {
// //         throw new Error("로그인이 필요합니다.");
// //       } else if (res.status === 403) {
// //         throw new Error("권한이 없습니다.");
// //       } else if (res.status === 404) {
// //         throw new Error("요청한 정보를 찾을 수 없습니다.");
// //       } else if (res.status === 500) {
// //         throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
// //       } else {
// //         throw new Error("오류가 발생했습니다. 다시 시도해주세요.");
// //       }
// //     }
// //   }
// // }
// //
// // export async function apiRequest(
// //   method: string,
// //   url: string,
// //   data?: unknown | undefined,
// // ): Promise<Response> {
// //   const res = await fetch(url, {
// //     method,
// //     headers: data ? { "Content-Type": "application/json" } : {},
// //     body: data ? JSON.stringify(data) : undefined,
// //     credentials: "include",
// //   });
// //
// //   await throwIfResNotOk(res);
// //   return res;
// // }
// //
// // type UnauthorizedBehavior = "returnNull" | "throw";
// // export const getQueryFn: <T>(options: {
// //   on401: UnauthorizedBehavior;
// // }) => QueryFunction<T> =
// //   ({ on401: unauthorizedBehavior }) =>
// //   async ({ queryKey }) => {
// //     const res = await fetch(queryKey.join("/") as string, {
// //       credentials: "include",
// //     });
// //
// //     if (unauthorizedBehavior === "returnNull" && res.status === 401) {
// //       return null;
// //     }
// //
// //     await throwIfResNotOk(res);
// //     return await res.json();
// //   };
// //
// // export const queryClient = new QueryClient({
// //   defaultOptions: {
// //     queries: {
// //       queryFn: getQueryFn({ on401: "throw" }),
// //       refetchInterval: false,
// //       refetchOnWindowFocus: false,
// //       staleTime: Infinity,
// //       retry: false,
// //     },
// //     mutations: {
// //       retry: false,
// //     },
// //   },
// // });
// import { QueryClient, QueryFunction } from "@tanstack/react-query";
//
// async function throwIfResNotOk(res: Response) {
//   if (!res.ok) {
//     const text = (await res.text()) || res.statusText;
//
//     try {
//       const errorData = JSON.parse(text);
//
//       if (errorData.error === "insufficient_coins") {
//         throw {
//           error: "insufficient_coins",
//           currentCoins: errorData.currentCoins,
//           requiredCoins: errorData.requiredCoins,
//           message: "보유 코인이 부족합니다."
//         };
//       }
//
//       const errorMessage = errorData.error || errorData.message || text;
//       throw new Error(errorMessage);
//     } catch (e) {
//       if (e instanceof Error && e.message) {
//         throw e;
//       }
//       if (typeof e === "object" && e !== null && "error" in e) {
//         throw e;
//       }
//
//       if (res.status === 400) {
//         throw new Error("요청을 처리할 수 없습니다. 입력 내용을 확인해주세요.");
//       } else if (res.status === 401) {
//         throw new Error("로그인이 필요합니다.");
//       } else if (res.status === 403) {
//         throw new Error("권한이 없습니다.");
//       } else if (res.status === 404) {
//         throw new Error("요청한 정보를 찾을 수 없습니다.");
//       } else if (res.status === 500) {
//         throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
//       } else {
//         throw new Error("오류가 발생했습니다. 다시 시도해주세요.");
//       }
//     }
//   }
// }
//
// // sessionStorage에서 Bearer 토큰 가져와 Authorization 헤더 구성
// function getAuthHeaders(): Record<string, string> {
//   const token = sessionStorage.getItem("bearerToken");
//   const headers: Record<string, string> = {};
//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }
//   return headers;
// }
//
// export async function apiRequest(
//     method: string,
//     url: string,
//     data?: unknown,
// ): Promise<Response> {
//   const baseHeaders: Record<string, string> = data
//       ? { "Content-Type": "application/json" }
//       : {};
//
//   const authHeaders = getAuthHeaders();
//
//   const res = await fetch(url, {
//     method,
//     headers: {
//       ...baseHeaders,
//       ...authHeaders,
//     },
//     body: data ? JSON.stringify(data) : undefined,
//     credentials: "include",
//   });
//
//   await throwIfResNotOk(res);
//   return res;
// }
//
// type UnauthorizedBehavior = "returnNull" | "throw";
//
// export const getQueryFn: <T>(options: {
//   on401: UnauthorizedBehavior;
// }) => QueryFunction<T> =
//     ({ on401: unauthorizedBehavior }) =>
//         async ({ queryKey }) => {
//           const url = String(queryKey[0]);
//
//           const res = await fetch(url, {
//             credentials: "include",
//             headers: getAuthHeaders(),
//           });
//
//           if (unauthorizedBehavior === "returnNull" && res.status === 401) {
//             return null as T;
//           }
//
//           await throwIfResNotOk(res);
//           return (await res.json()) as T;
//         };
//
// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       queryFn: getQueryFn({ on401: "throw" }),
//       refetchInterval: false,
//       refetchOnWindowFocus: false,
//       staleTime: Infinity,
//       retry: false,
//     },
//     mutations: {
//       retry: false,
//     },
//   },
// });

import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;

    try {
      const errorData = JSON.parse(text);

      if (errorData.error === "insufficient_coins") {
        throw {
          error: "insufficient_coins",
          currentCoins: errorData.currentCoins,
          requiredCoins: errorData.requiredCoins,
          message: "보유 코인이 부족합니다.",
        };
      }

      const errorMessage = errorData.error || errorData.message || text;
      throw new Error(errorMessage);
    } catch (e) {
      if (e instanceof Error && e.message) throw e;
      if (typeof e === "object" && e !== null && "error" in e) throw e;

      if (res.status === 400) throw new Error("요청을 처리할 수 없습니다.");
      if (res.status === 401) throw new Error("로그인이 필요합니다.");
      if (res.status === 403) throw new Error("권한이 없습니다.");
      if (res.status === 404) throw new Error("요청한 정보를 찾을 수 없습니다.");
      if (res.status === 500) throw new Error("서버 오류가 발생했습니다.");

      throw new Error("오류가 발생했습니다. 다시 시도해주세요.");
    }
  }
}

export async function apiRequest(
    method: string,
    url: string,
    data?: unknown,
): Promise<Response> {
  const token = sessionStorage.getItem("bearerToken");

  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
    ({ on401: unauthorizedBehavior }) =>
        async ({ queryKey }) => {
          const token = sessionStorage.getItem("bearerToken");

          const res = await fetch(queryKey.join("/") as string, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
          });

          if (unauthorizedBehavior === "returnNull" && res.status === 401) {
            return null as T;
          }

          await throwIfResNotOk(res);
          return await res.json();
        };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});