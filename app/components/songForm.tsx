"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod"; // Import zodResolver
import { zodResolver } from "@hookform/resolvers/zod";
import { SHA256 } from "crypto-js";
import { Toaster, toast } from "react-hot-toast"; // Import Toaster and toast

// Define your Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2).max(50),
  songUrlInput: z.string(),
  additionalText: z.string(),
  authorization: z.string(),
});

interface FormValues {
  name: string;
  songUrlInput: string;
  additionalText: string;
  authorization: string;
}

export function SongUploadForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  const [songUrls, setSongUrls] = useState<string[]>([]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const hashedAuthorization = SHA256(data.authorization).toString();

      const payload = {
        user: data.name,
        songs: songUrls,
        other: data.additionalText,
      };

      // Make the POST request to /api/song with hashed authorization header
      const response = await fetch("/api/song", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: hashedAuthorization,
        },
        body: JSON.stringify(payload),
      });

      // Check if the request was successful (status code 2xx)
      if (response.ok) {
        console.log("Song data submitted successfully:", payload);
        // Additional logic or feedback can be added here if needed
        toast.success("Dein Song würde Erfolgreich hochgeladen");
      } else {
        console.error(
          "Failed to submit song data:",
          response.status,
          response.statusText,
        );
        // Additional error handling can be added here
        toast.error("Fehler beim Übertragen der daten!");
      }
    } catch (error) {
      console.error("An error occurred during submission:", error);
      // Additional error handling can be added here
      toast.error("An error occurred during submission");
    }
  };

  const handleAddSongUrl = () => {
    const url = watch("songUrlInput");
    if (url) {
      setSongUrls((prevUrls) => [...prevUrls, url]);
      setValue("songUrlInput", ""); // Clear the input
    }
  };

  const handleRemoveSongUrl = (index: number) => {
    setSongUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };
  return (
    <>
      <div>
        <Toaster />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <label>Name</label>
          <Input {...register("name", { required: "Name ist erforderlich" })} />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label>Song URL</label>
          <Input
            placeholder="Gebe die URL zu deinem Song and und drücke Enter (YouTube)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSongUrl();
              }
            }}
            {...register("songUrlInput")}
          />
        </div>

        <div className="space-y-2">
          <label>Song URLs</label>
          {songUrls.map((url, index) => (
            <div
              key={index}
              className="flex items-center rounded bg-gray-200 p-2"
            >
              <span className="mr-2">{url}</span>
              <Button
                variant="outline"
                onClick={() => handleRemoveSongUrl(index)}
                className="hover:bg-transparent hover:bg-opacity-75"
              >
                x
              </Button>
            </div>
          ))}
        </div>

        <div>
          <label>Anmerkungen</label>
          <Textarea
            {...register("additionalText")}
            placeholder="Anmerkungen und Reihenfolge der Songs"
          />
        </div>

        <div>
          <label>Password</label>
          <Input
            {...register("authorization", {
              required: "Password ist erforderlich",
            })}
          />
          {errors.authorization && (
            <span className="text-red-500">{errors.authorization.message}</span>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit" variant="default">
            Absenden
          </Button>
        </div>
      </form>
    </>
  );
}
