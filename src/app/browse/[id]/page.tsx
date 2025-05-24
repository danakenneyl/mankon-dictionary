'use client';
// pages/dictionary.tsx
import  DisplayAlphabetized  from "@/browse/displayAlphabetized";
import { useParams } from 'next/navigation';
import "@/styles/home.css";
import "@/styles/contribute.css";
import "@/styles/browse.css";

export default function Browse() {
  const { id } = useParams<{ id: string }>();
  const choice = id ;
  if (choice === "browse-mankon") {
    return <DisplayAlphabetized page="mankon" />;
  } else if (choice === "browse-english") {
    return <DisplayAlphabetized page="english" />;
  }
  else if (choice === "browse-name") { 
    return <DisplayAlphabetized page="name" />;
  }
}