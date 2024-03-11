// pages/api/register.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    // Extract data from the request body
    const body = await request.json();
    const { firstname, lastname, email, password } = body;

    if (!email || !password) {
      return new NextResponse("Email and password are required", {
        status: 400,
      });
    }

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("Email already exists", {
        status: 400,
      });
    }

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const registrationResult = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        hashedPassword,
      },
    });
    // Respond with a success message
    return new NextResponse("User registered successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse("Internal Server error", {
      status: 500,
    });
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}

// Function to generate a random verification token
function generateRandomToken() {
  // Implement your logic to generate a random token (e.g., using crypto)
  // This is just a placeholder, replace it with a proper implementation
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
