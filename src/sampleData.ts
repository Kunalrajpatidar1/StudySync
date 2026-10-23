import { Video, Playlist } from "./types";

export type { Video, Playlist };

export const samplePlaylists: Record<string, Playlist> = {
  "PLhQjrBD2T3817j24-GogXmWqO5Q5vYy0V": {
    id: "PLhQjrBD2T3817j24-GogXmWqO5Q5vYy0V",
    title: "CS50P: Introduction to Programming with Python — Harvard University",
    channel: "CS50",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    videos: [
      { id: "cs50p-0", title: "Lecture 0: Functions, Variables & Expressions", duration: 5940, thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=320&auto=format&fit=crop&q=80" },
      { id: "cs50p-1", title: "Lecture 1: Conditionals & Boolean Logic", duration: 4620, thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=320&auto=format&fit=crop&q=80" },
      { id: "cs50p-2", title: "Lecture 2: Loops, Iteration & While Constructs", duration: 5280, thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc0429f4b75?w=320&auto=format&fit=crop&q=80" },
      { id: "cs50p-3", title: "Lecture 3: Exceptions & Defensive Handling", duration: 4140, thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=320&auto=format&fit=crop&q=80" },
      { id: "cs50p-4", title: "Lecture 4: Libraries, Modules & Command Line Arguments", duration: 4980, thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=320&auto=format&fit=crop&q=80" },
      { id: "cs50p-5", title: "Lecture 5: Unit Tests & Pytest Methodologies", duration: 4320, thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=320&auto=format&fit=crop&q=80" },
      { id: "cs50p-6", title: "Lecture 6: File I/O, CSV Handling & Persistent State", duration: 5700, thumbnail: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=320&auto=format&fit=crop&q=80" },
      { id: "cs50p-7", title: "Lecture 7: Regular Expressions & Pattern Validation", duration: 6120, thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&auto=format&fit=crop&q=80" },
      { id: "cs50p-8", title: "Lecture 8: Object-Oriented Programming, Classes & Methods", duration: 7380, thumbnail: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=320&auto=format&fit=crop&q=80" },
      { id: "cs50p-9", title: "Lecture 9: Et Cetera — Generators, Map, Filter & Unpacking", duration: 4860, thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=320&auto=format&fit=crop&q=80" },
      { id: "cs50p-10", title: "Final Project Showcase & Wrap-up (Bonus)", duration: 3180, thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=320&auto=format&fit=crop&q=80" },
    ],
  },
  "PLUl4u3cNGP63WbdFxL8giv4yhgdMGaZNA": {
    id: "PLUl4u3cNGP63WbdFxL8giv4yhgdMGaZNA",
    title: "MIT 6.100L: Introduction to CS and Programming Using Python",
    channel: "MIT OpenCourseWare",
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
    videos: [
      { id: "mit-1", title: "Lecture 1: Computational Thinking, Algorithms and Programs", duration: 3120, thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-2", title: "Lecture 2: Branching and Iteration Mechanics", duration: 3240, thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-3", title: "Lecture 3: String Manipulation, Guess-and-Check, Approximations", duration: 3360, thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-4", title: "Lecture 4: Decomposition, Abstractions, and Functions", duration: 3000, thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-5", title: "Lecture 5: Tuples, Lists, Aliasing, and Mutability", duration: 3180, thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-6", title: "Lecture 6: Recursion and Dictionaries in Depth", duration: 3420, thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-7", title: "Lecture 7: Testing, Debugging, Exceptions, Assertions", duration: 2940, thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-8", title: "Lecture 8: Object-Oriented Programming and Inheritance", duration: 3240, thumbnail: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-9", title: "Lecture 9: Computational Complexity and Asymptotic Analysis", duration: 3480, thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-10", title: "Lecture 10: Searching and Sorting Algorithms", duration: 3300, thumbnail: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-11", title: "Lecture 11: Plotting and Dynamic Graphing with Matplotlib", duration: 2880, thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=320&auto=format&fit=crop&q=80" },
      { id: "mit-12", title: "Lecture 12: Capstone Wrap-up & Further Explorations", duration: 2700, thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=320&auto=format&fit=crop&q=80" },
    ],
  },
  "PL_c9BZzLwBRKKqOc9TJz1pP0ASrxLMG7e": {
    id: "PL_c9BZzLwBRKKqOc9TJz1pP0ASrxLMG7e",
    title: "Mastering Data Structures & Algorithms in Modern C++",
    channel: "Algorithms Simplified",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    videos: [
      { id: "dsa-1", title: "01. Introduction to Modern C++ & Memory Models", duration: 2400, thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=320&auto=format&fit=crop&q=80" },
      { id: "dsa-2", title: "02. Big-O Complexity, Amortized Analysis & Tradeoffs", duration: 2700, thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=320&auto=format&fit=crop&q=80" },
      { id: "dsa-3", title: "03. Arrays, Vectors, & Cache Locality Principles", duration: 2880, thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc0429f4b75?w=320&auto=format&fit=crop&q=80" },
      { id: "dsa-4", title: "04. Singly & Doubly Linked Lists from Scratch", duration: 3120, thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=320&auto=format&fit=crop&q=80" },
      { id: "dsa-5", title: "05. Stacks, Queues, and Monotonic Queue Patterns", duration: 2940, thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=320&auto=format&fit=crop&q=80" },
      { id: "dsa-6", title: "06. Hash Tables, Probing, and Collision Resolution", duration: 3300, thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=320&auto=format&fit=crop&q=80" },
      { id: "dsa-7", title: "07. Binary Search Trees & Balanced AVL Trees", duration: 3600, thumbnail: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=320&auto=format&fit=crop&q=80" },
      { id: "dsa-8", title: "08. Heaps, Priority Queues & Top-K Problems", duration: 2760, thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&auto=format&fit=crop&q=80" },
      { id: "dsa-9", title: "09. Graph Traversals: BFS, DFS & Topological Sort", duration: 3900, thumbnail: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=320&auto=format&fit=crop&q=80" },
      { id: "dsa-10", title: "10. Shortest Paths: Dijkstra, Bellman-Ford & A*", duration: 3720, thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=320&auto=format&fit=crop&q=80" },
      { id: "dsa-11", title: "11. Dynamic Programming 1D & 2D Memoization Patterns", duration: 4200, thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=320&auto=format&fit=crop&q=80" },
    ],
  },
};
