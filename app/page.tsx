// Import necessary modules and components
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SongUploadForm } from "./components/songForm";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Song Einreichen</CardTitle>
          <CardDescription>
            Gib die Songs an, die beim Springen laufen sollen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SongUploadForm />
        </CardContent>
        <CardFooter>
          <p></p>
        </CardFooter>
      </Card>
    </main>
  );
}
