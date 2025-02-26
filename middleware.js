import { NextResponse } from "next/server";

export function middleware(req) {
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, password] = atob(authValue).split(":");

    // 認証情報を設定（ユーザー名とパスワードを変更）
    if (user === "seishin" && password === "seishin2025") {
      return NextResponse.next();
    }
  }

  const response = new NextResponse("Authentication Required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
  });

  return response;
}
