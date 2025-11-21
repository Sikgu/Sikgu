// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import { apiRequest, getQueryFn } from "@/lib/queryClient";
// //
// // interface User {
// //   id: string;
// //   username: string;
// //   coins: number;
// //   address: string | null;
// //   phone: string | null;
// // }
// //
// // export function useAuth() {
// //   const queryClient = useQueryClient();
// //
// //   const { data: user, isLoading } = useQuery<User>({
// //     queryKey: ["/auth/me"],
// //     queryFn: getQueryFn({ on401: "returnNull" }),
// //     retry: false,
// //   });
// //
// //   const loginMutation = useMutation({
// //     mutationFn: async ({ email, password }: { email: string; password: string }) => {
// //       const response = await fetch("/auth/login", {
// //         method: "POST",
// //         body: JSON.stringify({ email, password }),
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         credentials: "include",
// //       });
// //
// //       if (!response.ok) {
// //         const error = await response.text();
// //         throw new Error(error);
// //       }
// //
// //       const data = await response.json();
// //
// //       // Bearer token을 sessionStorage에 저장
// //       if (data.token) {
// //         sessionStorage.setItem("bearerToken", data.token);
// //       }
// //
// //       return data;
// //     },
// //     onSuccess: (data) => {
// //       queryClient.setQueryData(["/auth/me"], data);
// //       queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
// //     },
// //   });
// //
// //   const logoutMutation = useMutation({
// //     mutationFn: async () => {
// //       const response = await fetch("/auth/logout", {
// //         method: "POST",
// //         credentials: "include",
// //       });
// //
// //       if (!response.ok) {
// //         const error = await response.text();
// //         throw new Error(error);
// //       }
// //
// //       return response.json();
// //     },
// //     onSuccess: () => {
// //       // Bearer token 제거
// //       sessionStorage.removeItem("bearerToken");
// //       // Clear all cached data to prevent data leakage between users
// //       queryClient.clear();
// //       queryClient.setQueryData(["/auth/me"], null);
// //     },
// //   });
// //
// //   return {
// //     user,
// //     isLoading,
// //     isAuthenticated: !!user,
// //     login: loginMutation.mutateAsync,
// //     logout: logoutMutation.mutateAsync,
// //     isLoginLoading: loginMutation.isPending,
// //     isLogoutLoading: logoutMutation.isPending,
// //   };
// // }
//
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { getQueryFn } from "@/lib/queryClient";
//
// interface User {
//   id: string;
//   username: string;
//   coins: number;
//   address: string | null;
//   phone: string | null;
// }
//
// export function useAuth() {
//   const queryClient = useQueryClient();
//
//   // JWT 토큰 기반 현재 로그인 사용자 정보 조회
//   const { data: user, isLoading } = useQuery<User | null>({
//     queryKey: ["/auth/me"],
//     queryFn: getQueryFn({ on401: "returnNull" }),
//     retry: false,
//   });
//
//   const loginMutation = useMutation({
//     mutationFn: async ({ email, password }: { email: string; password: string }) => {
//       const response = await fetch("/auth/login", {
//         method: "POST",
//         body: JSON.stringify({ email, password }),
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//
//       if (!response.ok) {
//         const err = await response.text();
//         throw new Error(err || "로그인 실패");
//       }
//
//       const data = (await response.json()) as { token?: string };
//
//       if (!data.token) {
//         throw new Error("로그인 응답에 토큰이 없습니다.");
//       }
//
//       // JWT 저장
//       sessionStorage.setItem("bearerToken", data.token);
//
//       return data;
//     },
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
//     },
//   });
//
//   const logoutMutation = useMutation({
//     mutationFn: async () => {
//       return Promise.resolve(); // 서버에 /auth/logout 없음
//     },
//     onSuccess: () => {
//       sessionStorage.removeItem("bearerToken");
//       queryClient.clear();
//       queryClient.setQueryData(["/auth/me"], null);
//     },
//   });
//
//   return {
//     user,
//     isLoading,
//     isAuthenticated: !!user,
//     login: loginMutation.mutateAsync,
//     logout: logoutMutation.mutateAsync,
//     isLoginLoading: loginMutation.isPending,
//     isLogoutLoading: logoutMutation.isPending,
//   };
// }
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  coins: number;
  address: string | null;
  phone: string | null;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // 현재 로그인된 유저 조회
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["me"],
    queryFn: async () => {
      const token = sessionStorage.getItem("bearerToken");

      const res = await fetch("/auth/me", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401) return null; // 로그인 안 한 상태
      return await res.json();
    },
    retry: false,
    staleTime: Infinity,
  });

  // 로그인 요청
  const loginMutation = useMutation({
    mutationFn: async ({
                         email,
                         password,
                       }: {
      email: string;
      password: string;
    }) => {
      const res = await fetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const data = await res.json();

      // Bearer 토큰 저장
      if (data.token) {
        sessionStorage.setItem("bearerToken", data.token);
      }

      return data;
    },

    onSuccess: () => {
      // 로그인 직후 강제 재조회 → 여기서 401 나오면 절대 안 됨 (토큰 저장했으니 성공)
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  // 로그아웃 요청
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = sessionStorage.getItem("bearerToken");
      
      if (!token) {
        throw new Error("로그인 상태가 아닙니다.");
      }

      const res = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      sessionStorage.removeItem("bearerToken");
      queryClient.clear();
      queryClient.setQueryData(["me"], null);
    },
    onError: () => {
      // 백엔드 요청 실패해도 클라이언트 측 로그아웃 처리
      sessionStorage.removeItem("bearerToken");
      queryClient.clear();
      queryClient.setQueryData(["me"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
  };
}