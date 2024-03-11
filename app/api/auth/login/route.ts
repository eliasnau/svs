// pages/api/login.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "@/app/libs/prismadb";

export async function POST(request: NextResponse) {
  try {
    // Extract data from the request body
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse("Email and password are required", {
        status: 400,
      });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !user.hashedPassword) {
      return new NextResponse("User not found", {
        status: 404,
      });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordMatch) {
      return new NextResponse("Invalid password", {
        status: 401,
      });
    }

    // Generate a new token using crypto
    const token = crypto.randomBytes(32).toString("hex");

    // Create a new Login object and associate it with the User
    const loginResult = await prisma.login.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        cookie: token,
        // Add other information like IP, device, browser, etc. as needed
        // For simplicity, I'm adding placeholders
        ip: "127.0.0.1",
        device: "Desktop",
        browser: "Chrome",
      },
    });

    // Log the user in (you can set up your authentication logic here)
    // For simplicity, I'm returning the cookies in the response
    const response = new NextResponse("Login successful", {
      status: 200,
    });

    // Set cookies using NextResponse
    response.cookies.set("userId", user.id);
    response.cookies.set("token", token);

    return response;
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse("Internal Server error", {
      status: 500,
    });
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}
