import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { SHA256 } from "crypto-js";

export async function POST(request: NextResponse) {
  try {
    // Input validation using guard clauses
    const body = await request.json();
    const { user, songs, other } = body;
    const auth = request.headers.get("authorization");

    if (!user || !songs || !auth) {
      return new NextResponse("Unprocessable Entity", { status: 422 });
    }

    const hashedAuthorization = auth;
    const authorizationKey = SHA256(process.env.PASSWORD).toString();

    if (!(hashedAuthorization === authorizationKey)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!Array.isArray(songs) || songs.some((song) => !isUrl(song))) {
      return new NextResponse("Unprocessable Entity", { status: 422 });
    }

    // Create a new Post
    const newPost = await prisma.post.create({
      data: {
        user,
        songs: songs, // Join songs array into a string
        other,
      },
    });

    return new NextResponse(JSON.stringify(newPost), { status: 201 });
  } catch (error) {
    console.error("Error creating Post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}

function isUrl(url: string) {
  // Regular expression for a URL pattern with optional protocol
  const urlPattern =
    /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;

  // Test the string against the URL pattern
  return urlPattern.test(url);
}
