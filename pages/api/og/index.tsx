import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    console.log("Search Param", searchParams);

    // ?title=<title>
    const hasTitle = searchParams.has("title")
      ? searchParams.get("title")?.slice(0, 100)
      : "Afrikipresse • Suivez afrikipresse toute l'actualité";

    const hasImage =
      searchParams.get("image") || "https://www.afrikipresse.com/default.png";

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: "black",
            backgroundSize: "150px 150px",
            height: "100%",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            flexWrap: "nowrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              justifyItems: "center",
            }}
          >
            <img
              alt="Afrikipresse"
              height={400}
              src={hasImage}
              style={{ objectFit: "cover" }}
              tw="absolute inset-0 w-full h-full"
              width={500}
            />
          </div>
          <div
            style={{
              fontSize: 60,
              fontStyle: "normal",
              letterSpacing: "-0.025em",
              color: "white",
              marginTop: 30,
              padding: "0 120px",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
            }}
          >
            {hasTitle}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
