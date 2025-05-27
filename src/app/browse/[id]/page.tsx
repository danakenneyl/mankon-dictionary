'use client';
// pages/dictionary.tsx
import  BrowseAlphabetized  from "@/app/browse/BrowseAlphabetized";
import { useParams } from 'next/navigation';

export default function Browse() {
  const { id } = useParams<{ id: string }>();
  const choice = id ;
  if (choice === "browse-mankon") {
    return <BrowseAlphabetized page="mankon" />;
  } else if (choice === "browse-english") {
    return <BrowseAlphabetized page="english" />;
  }
  else if (choice === "browse-name") { 
    return <BrowseAlphabetized page="name" />;
  }
}