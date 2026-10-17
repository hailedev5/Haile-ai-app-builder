export interface LanguageDefinition {
  id: string;
  name: string;
  category: 'Systems' | 'Scripting' | 'Web & Frontend' | 'Functional' | 'Data & Query' | 'Esoteric & Classical';
  extension: string;
  version: string;
  monacoMode: string;
  sampleCode: string;
  sampleStdin?: string;
  description: string;
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  // 1. Python
  {
    id: 'python',
    name: 'Python',
    category: 'Scripting',
    extension: 'py',
    version: '3.11+',
    monacoMode: 'python',
    description: 'High-level, expressive general-purpose language with dynamic typing.',
    sampleCode: `# Haile AI - Python 3
import sys

def fibonacci(n):
    a, b = 0, 1
    seq = []
    for _ in range(n):
        seq.append(a)
        a, b = b, a + b
    return seq

print("=== Python 3 Polyglot Runner ===")
print("Fibonacci Sequence (first 10 numbers):")
print(fibonacci(10))

# Reading stdin if provided
stdin_data = sys.stdin.read().strip()
if stdin_data:
    print(f"Stdin received: {stdin_data}")
`,
    sampleStdin: 'Hello from Standard Input!',
  },

  // 2. JavaScript
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Web & Frontend',
    extension: 'js',
    version: 'Node.js / ES2024',
    monacoMode: 'javascript',
    description: 'Universal language of the web, event-driven and asynchronous.',
    sampleCode: `// Haile AI - JavaScript (Node.js / In-Browser)
console.log("=== JavaScript Execution Engine ===");

const users = [
  { id: 1, name: "Haile", role: "Architect", points: 98 },
  { id: 2, name: "Abebe", role: "Engineer", points: 85 },
  { id: 3, name: "Sara", role: "Scientist", points: 92 },
];

const topPerformers = users
  .filter(u => u.points >= 90)
  .map(u => \`\${u.name} (\${u.role}) - \${u.points} pts\`);

console.log("Top Performers:");
topPerformers.forEach(p => console.log(" •", p));

const sum = users.reduce((acc, curr) => acc + curr.points, 0);
console.log(\`Average Points: \${(sum / users.length).toFixed(1)}\`);
`,
  },

  // 3. TypeScript
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Web & Frontend',
    extension: 'ts',
    version: '5.x',
    monacoMode: 'typescript',
    description: 'Typed superset of JavaScript providing static types and modern tooling.',
    sampleCode: `// Haile AI - TypeScript Compiler
interface Matrix2D<T> {
  rows: number;
  cols: number;
  data: T[][];
}

function createIdentity(size: number): Matrix2D<number> {
  const data: number[][] = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      row.push(i === j ? 1 : 0);
    }
    data.push(row);
  }
  return { rows: size, cols: size, data };
}

console.log("=== TypeScript Strict Matrix ===");
const identity3x3 = createIdentity(3);
console.log("Identity Matrix (3x3):");
identity3x3.data.forEach(row => console.log(" ", row.join(" ")));
`,
  },

  // 4. C
  {
    id: 'c',
    name: 'C',
    category: 'Systems',
    extension: 'c',
    version: 'C17 / C99 (TCC & GCC)',
    monacoMode: 'c',
    description: 'Foundational systems language with direct memory control and bare-metal speed.',
    sampleCode: `// Haile AI - C Language Compiler
#include <stdio.h>
#include <stdlib.h>

void print_binary(unsigned int n) {
    for (int i = 7; i >= 0; i--) {
        printf("%d", (n >> i) & 1);
    }
}

int main(void) {
    printf("=== C Polyglot Compiler ===\\n");
    int numbers[] = { 10, 42, 128, 255 };
    int count = sizeof(numbers) / sizeof(numbers[0]);

    for (int i = 0; i < count; i++) {
        printf("Decimal: %3d  | Binary: ", numbers[i]);
        print_binary(numbers[i]);
        printf("  | Hex: 0x%02X\\n", numbers[i]);
    }
    return 0;
}
`,
  },

  // 5. C++
  {
    id: 'cpp',
    name: 'C++',
    category: 'Systems',
    extension: 'cpp',
    version: 'C++20 / C++17 (G++)',
    monacoMode: 'cpp',
    description: 'High-performance object-oriented and generic systems programming language.',
    sampleCode: `// Haile AI - C++20 Compiler
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
    std::cout << "=== C++ Modern Algorithms ===" << std::endl;
    std::vector<int> data = {19, 4, 87, 23, 65, 12, 90, 3};

    std::sort(data.begin(), data.end());
    std::cout << "Sorted numbers: ";
    for (int n : data) {
        std::cout << n << " ";
    }
    std::cout << std::endl;

    double avg = std::accumulate(data.begin(), data.end(), 0.0) / data.size();
    std::cout << "Average: " << avg << std::endl;
    return 0;
}
`,
  },

  // 6. PHP
  {
    id: 'php',
    name: 'PHP',
    category: 'Scripting',
    extension: 'php',
    version: '8.2+',
    monacoMode: 'php',
    description: 'Server-side scripting language powering dynamic web backends.',
    sampleCode: `<?php
// Haile AI - PHP CLI Engine
echo "=== PHP Scripting Runner ===\\n";

$dataset = [
    "Product A" => 120.50,
    "Product B" => 45.00,
    "Product C" => 310.90,
    "Product D" => 89.20
];

arsort($dataset);

echo "Products sorted by value:\\n";
foreach ($dataset as $item => $price) {
    printf(" - %-10s : $%0.2f\\n", $item, $price);
}

$taxRate = 0.15;
$total = array_sum($dataset) * (1 + $taxRate);
printf("Total with 15%% tax: $%0.2f\\n", $total);
?>
`,
  },

  // 7. Ruby
  {
    id: 'ruby',
    name: 'Ruby',
    category: 'Scripting',
    extension: 'rb',
    version: '3.x',
    monacoMode: 'ruby',
    description: 'Elegant object-oriented language focused on programmer happiness.',
    sampleCode: `# Haile AI - Ruby Interpreter
puts "=== Ruby Elegant Scripting ==="

class Account
  attr_reader :name, :balance

  def initialize(name, balance = 0)
    @name = name
    @balance = balance
  end

  def deposit(amount)
    @balance += amount
    puts "[\#{@name}] Deposited $\#{amount}. Balance: $\#{@balance}"
  end
end

acc = Account.new("Haile Dev", 1000)
acc.deposit(250)
acc.deposit(500)

squares = (1..6).map { |n| n ** 2 }
puts "Squares: \#{squares.inspect}"
`,
  },

  // 8. Perl
  {
    id: 'perl',
    name: 'Perl',
    category: 'Scripting',
    extension: 'pl',
    version: '5.36+',
    monacoMode: 'perl',
    description: 'Powerful text-processing and Unix systems scripting language.',
    sampleCode: `#!/usr/bin/perl
use strict;
use warnings;

print "=== Perl 5 Text Processing ===\\n";

my $log = "2026-10-16 18:30:12 [INFO] Connection established from 192.168.1.42:8080";
if ($log =~ /(\\d{4}-\\d{2}-\\d{2})\\s+(\\d{2}:\\d{2}:\\d{2})\\s+\\[(\\w+)\\]\\s+(.*)/) {
    print "Date: $1\\n";
    print "Time: $2\\n";
    print "Level: $3\\n";
    print "Message: $4\\n";
}
`,
  },

  // 9. Lua
  {
    id: 'lua',
    name: 'Lua',
    category: 'Scripting',
    extension: 'lua',
    version: '5.3 / 5.4',
    monacoMode: 'lua',
    description: 'Ultra-lightweight, embeddable scripting language widely used in gaming and systems.',
    sampleCode: `-- Haile AI - Lua Runner
print("=== Lua 5.x Lightweight Engine ===")

function factorial(n)
    if n == 0 then return 1 end
    return n * factorial(n - 1)
end

for i = 1, 7 do
    print(string.format("factorial(%d) = %d", i, factorial(i)))
end

local table_demo = { name = "Haile AI", speed = "Sub-millisecond", core = "C" }
print("\\nEngine Metadata:")
for k, v in pairs(table_demo) do
    print(" - " .. k .. ": " .. v)
end
`,
  },

  // 10. Bash / Shell
  {
    id: 'bash',
    name: 'Bash',
    category: 'Scripting',
    extension: 'sh',
    version: 'GNU Bash 5+',
    monacoMode: 'shell',
    description: 'Unix command-line shell language for automation, pipelines, and operating systems.',
    sampleCode: `#!/usr/bin/env bash
# Haile AI - Bash Shell Runner
echo "=== Bash Shell Environment ==="
echo "Operating System: $(uname -s)"
echo "Architecture: $(uname -m)"
echo "Current Date: $(date)"

echo ""
echo "Counting loops:"
for i in {1..5}; do
    printf " • Step %d: Ready\\n" "$i"
done
`,
  },

  // 11. SQL / SQLite
  {
    id: 'sql',
    name: 'SQL (SQLite)',
    category: 'Data & Query',
    extension: 'sql',
    version: 'SQLite 3.x',
    monacoMode: 'sql',
    description: 'Declarative query language for relational database management.',
    sampleCode: `-- Haile AI - SQLite Engine
CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    stars INTEGER DEFAULT 0,
    category TEXT
);

INSERT INTO projects (name, stars, category) VALUES
    ('Haile AI', 5400, 'AI / Reasoning'),
    ('Polyglot Compiler', 3200, 'Developer Tools'),
    ('Mermaid Canvas', 1850, 'Visualization'),
    ('Vector Engine', 4100, 'AI / Reasoning');

SELECT category, COUNT(*) as count, AVG(stars) as avg_stars
FROM projects
GROUP BY category
ORDER BY avg_stars DESC;

SELECT * FROM projects WHERE stars > 3000;
`,
  },

  // 12. Go (Golang)
  {
    id: 'go',
    name: 'Go (Golang)',
    category: 'Systems',
    extension: 'go',
    version: '1.22+',
    monacoMode: 'go',
    description: 'Simple, fast, concurrent compiled language engineered at Google.',
    sampleCode: `package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Worker %d starting...\\n", id)
	time.Sleep(10 * time.Millisecond)
	fmt.Printf("Worker %d completed!\\n", id)
}

func main() {
	fmt.Println("=== Go Concurrency Engine ===")
	var wg sync.WaitGroup

	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go worker(i, &wg)
	}

	wg.Wait()
	fmt.Println("All goroutines finished successfully.")
}
`,
  },

  // 13. Rust
  {
    id: 'rust',
    name: 'Rust',
    category: 'Systems',
    extension: 'rs',
    version: '1.75+',
    monacoMode: 'rust',
    description: 'Memory-safe systems programming language without garbage collection.',
    sampleCode: `// Haile AI - Rust Compiler
fn is_prime(n: u64) -> bool {
    if n <= 1 { return false; }
    if n <= 3 { return true; }
    if n % 2 == 0 || n % 3 == 0 { return false; }
    let mut i = 5;
    while i * i <= n {
        if n % i == 0 || n % (i + 2) == 0 { return false; }
        i += 6;
    }
    true
}

fn main() {
    println!("=== Rust Memory-Safe Computation ===");
    let primes: Vec<u64> = (1..50).filter(|&x| is_prime(x)).collect();
    println!("Primes under 50: {:?}", primes);
    println!("Total prime count: {}", primes.len());
}
`,
  },

  // 14. Java
  {
    id: 'java',
    name: 'Java',
    category: 'Systems',
    extension: 'java',
    version: 'OpenJDK 17 / 21',
    monacoMode: 'java',
    description: 'Robust, platform-independent object-oriented language for enterprise applications.',
    sampleCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Java Enterprise Virtual Machine ===");
        
        java.util.List<String> frameworks = java.util.List.of("Spring Boot", "Quarkus", "Micronaut", "Vert.x");
        frameworks.stream()
            .filter(f -> f.length() > 6)
            .map(String::toUpperCase)
            .forEach(f -> System.out.println(" • " + f));
            
        long memory = Runtime.getRuntime().totalMemory() / (1024 * 1024);
        System.out.println("JVM Initial Memory: " + memory + " MB");
    }
}
`,
  },

  // 15. Kotlin
  {
    id: 'kotlin',
    name: 'Kotlin',
    category: 'Systems',
    extension: 'kt',
    version: '1.9+',
    monacoMode: 'kotlin',
    description: 'Concise, modern multiplatform language interoperable with Java.',
    sampleCode: `data class Task(val id: Int, val title: String, val completed: Boolean)

fun main() {
    println("=== Kotlin Modern Language ===")
    val tasks = listOf(
        Task(1, "Build 50-Lang Compiler", true),
        Task(2, "Integrate Mermaid visualizer", true),
        Task(3, "Deploy to Cloud Run", false)
    )

    val (done, pending) = tasks.partition { it.completed }
    println("Completed tasks: \${done.map { it.title }}")
    println("Pending tasks: \${pending.map { it.title }}")
}
`,
  },

  // 16. Swift
  {
    id: 'swift',
    name: 'Swift',
    category: 'Systems',
    extension: 'swift',
    version: '5.9+',
    monacoMode: 'swift',
    description: 'Fast, modern, type-safe programming language engineered by Apple.',
    sampleCode: `import Foundation

print("=== Swift Safe Systems Language ===")

enum HTTPStatus {
    case success(code: Int)
    case failure(reason: String)
}

func handle(status: HTTPStatus) {
    switch status {
    case .success(let code):
        print("Success response code: \\(code)")
    case .failure(let reason):
        print("Encountered error: \\(reason)")
    }
}

handle(status: .success(code: 200))
`,
  },

  // 17. C# (.NET)
  {
    id: 'csharp',
    name: 'C#',
    category: 'Systems',
    extension: 'cs',
    version: '.NET 8 / 9',
    monacoMode: 'csharp',
    description: 'Modern, object-oriented language for cross-platform cloud and desktop applications.',
    sampleCode: `using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("=== C# .NET Cross-Platform ===");
        var scores = new[] { 88, 92, 79, 95, 100, 64 };
        
        var honorRoll = scores.Where(s => s >= 90).OrderByDescending(s => s);
        Console.WriteLine("Top Scores: " + string.Join(", ", honorRoll));
    }
}
`,
  },

  // 18. R
  {
    id: 'r',
    name: 'R',
    category: 'Data & Query',
    extension: 'r',
    version: '4.3+',
    monacoMode: 'r',
    description: 'Specialized language for statistical computing, data analysis, and graphics.',
    sampleCode: `# Haile AI - R Statistical Engine
cat("=== R Statistical Computing ===\\n")

data_sample <- c(12.4, 15.2, 18.9, 14.1, 16.8, 22.0, 19.5)
cat("Mean: ", mean(data_sample), "\\n")
cat("Standard Deviation: ", sd(data_sample), "\\n")
cat("Summary Statistics:\\n")
print(summary(data_sample))
`,
  },

  // 19. Dart
  {
    id: 'dart',
    name: 'Dart',
    category: 'Web & Frontend',
    extension: 'dart',
    version: '3.x',
    monacoMode: 'dart',
    description: 'Client-optimized language for fast multiplatform apps and Flutter.',
    sampleCode: `void main() {
  print('=== Dart Multiplatform Language ===');
  final greeting = 'Hello from Haile AI';
  final numbers = [1, 2, 3, 4, 5];
  final doubled = numbers.map((n) => n * 2).toList();
  
  print('\$greeting');
  print('Original: \$numbers');
  print('Doubled: \$doubled');
}
`,
  },

  // 20. Scala
  {
    id: 'scala',
    name: 'Scala',
    category: 'Functional',
    extension: 'scala',
    version: '3.3+',
    monacoMode: 'scala',
    description: 'Unifies object-oriented and functional programming with strong static types.',
    sampleCode: `object Main extends App {
  println("=== Scala Functional & OOP ===")
  val numbers = List(1, 2, 3, 4, 5, 6)
  val evensSquared = numbers.filter(_ % 2 == 0).map(x => x * x)
  println(s"Even numbers squared: \$evensSquared")
}
`,
  },

  // 21. Haskell
  {
    id: 'haskell',
    name: 'Haskell',
    category: 'Functional',
    extension: 'hs',
    version: 'GHC 9+',
    monacoMode: 'haskell',
    description: 'Purely functional programming language with strong mathematical type inference.',
    sampleCode: `-- Haile AI - Haskell Pure Functional
quicksort :: (Ord a) => [a] -> [a]
quicksort [] = []
quicksort (x:xs) =
    let smaller = quicksort [a | a <- xs, a <= x]
        bigger  = quicksort [a | a <- xs, a > x]
    in  smaller ++ [x] ++ bigger

main :: IO ()
main = do
    putStrLn "=== Haskell Pure Functional Engine ==="
    let unsorted = [64, 25, 12, 22, 11, 90]
    putStrLn ("Original: " ++ show unsorted)
    putStrLn ("Sorted:   " ++ show (quicksort unsorted))
`,
  },

  // 22. Julia
  {
    id: 'julia',
    name: 'Julia',
    category: 'Data & Query',
    extension: 'jl',
    version: '1.10+',
    monacoMode: 'julia',
    description: 'High-level, high-performance language for technical and numerical computing.',
    sampleCode: `# Haile AI - Julia Scientific Computing
println("=== Julia Numerical Computing ===")

function mandelbrot(c, maxiter=100)
    z = 0.0 + 0.0im
    for i in 1:maxiter
        if abs(z) > 2.0
            return i
        end
        z = z^2 + c
    end
    return maxiter
end

println("Mandelbrot sample value: ", mandelbrot(0.3 + 0.5im))
`,
  },

  // 23. Elixir
  {
    id: 'elixir',
    name: 'Elixir',
    category: 'Functional',
    extension: 'ex',
    version: '1.16+',
    monacoMode: 'elixir',
    description: 'Dynamic, functional language for building scalable, maintainable distributed systems.',
    sampleCode: `# Haile AI - Elixir BEAM Engine
defmodule MathPipeline do
  def run do
    1..10
    |> Enum.map(&(&1 * 3))
    |> Enum.filter(&(rem(&1, 2) == 0))
    |> Enum.sum()
  end
end

IO.puts("=== Elixir Pipe Operator Demo ===")
IO.puts("Sum of even multiples of 3 (1..10): #{MathPipeline.run()}")
`,
  },

  // 24. Erlang
  {
    id: 'erlang',
    name: 'Erlang',
    category: 'Functional',
    extension: 'erl',
    version: 'OTP 26+',
    monacoMode: 'erlang',
    description: 'Battle-tested concurrent functional language for fault-tolerant telecom architectures.',
    sampleCode: `-module(main).
-export([start/0]).

factorial(0) -> 1;
factorial(N) when N > 0 -> N * factorial(N - 1).

start() ->
    io:format("=== Erlang OTP Actor Engine ===~n"),
    io:format("factorial(6) = ~p~n", [factorial(6)]).
`,
  },

  // 25. Clojure
  {
    id: 'clojure',
    name: 'Clojure',
    category: 'Functional',
    extension: 'clj',
    version: '1.11+',
    monacoMode: 'clojure',
    description: 'Dynamic, functional dialect of Lisp hosted on the Java Virtual Machine.',
    sampleCode: `;; Haile AI - Clojure Lisp Dialect
(println "=== Clojure JVM Lisp Engine ===")

(defn word-freq [text]
  (frequencies (re-seq #"\\w+" (.toLowerCase text))))

(def sample "Haile AI is brilliant and Haile AI is fast")
(println "Word frequencies:")
(doseq [[w count] (word-freq sample)]
  (println (str " • " w ": " count)))
`,
  },

  // 26. F#
  {
    id: 'fsharp',
    name: 'F#',
    category: 'Functional',
    extension: 'fs',
    version: '.NET 8 / 9',
    monacoMode: 'fsharp',
    description: 'Succinct, robust, functional-first language on the .NET platform.',
    sampleCode: `open System

printfn "=== F# Functional First ==="

let square x = x * x
let numbers = [ 1 .. 8 ]
let sumOfSquares = numbers |> List.map square |> List.sum

printfn "Numbers: %A" numbers
printfn "Sum of Squares: %d" sumOfSquares
`,
  },

  // 27. OCaml
  {
    id: 'ocaml',
    name: 'OCaml',
    category: 'Functional',
    extension: 'ml',
    version: '5.x',
    monacoMode: 'ocaml',
    description: 'Industrial-strength functional programming language with expressive type safety.',
    sampleCode: `(* Haile AI - OCaml Functional Engine *)
let rec gcd a b =
  if b = 0 then a else gcd b (a mod b)

let () =
  print_endline "=== OCaml Expressive Type Engine ===";
  Printf.printf "GCD of 48 and 18 is: %d\\n" (gcd 48 18)
`,
  },

  // 28. D (Dlang)
  {
    id: 'dlang',
    name: 'D',
    category: 'Systems',
    extension: 'd',
    version: 'DMD 2.x',
    monacoMode: 'd',
    description: 'General-purpose systems programming language combining efficiency with productivity.',
    sampleCode: `import std.stdio;
import std.algorithm;
import std.array;

void main() {
    writeln("=== D Language Fast Systems ===");
    int[] numbers = [10, 4, 33, 89, 2];
    auto sorted = numbers.sort().array;
    writeln("Sorted array: ", sorted);
}
`,
  },

  // 29. Nim
  {
    id: 'nim',
    name: 'Nim',
    category: 'Systems',
    extension: 'nim',
    version: '2.x',
    monacoMode: 'nim',
    description: 'Statically typed compiled language combining Python-like syntax with C speed.',
    sampleCode: `# Haile AI - Nim Language
echo "=== Nim Pythonic Systems Language ==="

proc collatz(n: int): seq[int] =
  var cur = n
  result = @[cur]
  while cur != 1:
    if cur mod 2 == 0:
      cur = cur div 2
    else:
      cur = 3 * cur + 1
    result.add(cur)

echo "Collatz sequence for 12: ", collatz(12)
`,
  },

  // 30. Zig
  {
    id: 'zig',
    name: 'Zig',
    category: 'Systems',
    extension: 'zig',
    version: '0.12+',
    monacoMode: 'zig',
    description: 'General-purpose systems programming language and toolchain designed to replace C.',
    sampleCode: `const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("=== Zig Next-Gen Systems Language ===\\n", .{});
    const values = [_]u32{ 1, 2, 3, 5, 8, 13 };
    var sum: u32 = 0;
    for (values) |v| {
        sum += v;
    }
    try stdout.print("Sum of Fibonacci prefix: {d}\\n", .{sum});
}
`,
  },

  // 31. Fortran
  {
    id: 'fortran',
    name: 'Fortran',
    category: 'Data & Query',
    extension: 'f90',
    version: 'F90 / F95 / F2008',
    monacoMode: 'fortran',
    description: 'Legendary scientific language tailored for high-performance array calculations.',
    sampleCode: `program matrix_calc
  implicit none
  real :: a(3,3), b(3,3), c(3,3)
  integer :: i

  print *, "=== Fortran Scientific Computing ==="
  a = 1.5
  b = 2.0
  c = matmul(a, b)
  print *, "Matrix product computed successfully. Diagonal:", c(1,1), c(2,2), c(3,3)
end program matrix_calc
`,
  },

  // 32. Pascal
  {
    id: 'pascal',
    name: 'Pascal',
    category: 'Systems',
    extension: 'pas',
    version: 'FreePascal 3.x',
    monacoMode: 'pascal',
    description: 'Clean, structured classical programming language designed for clarity.',
    sampleCode: `program PascalDemo;
var
  i, sum: integer;
begin
  writeln('=== Pascal Structured Engine ===');
  sum := 0;
  for i := 1 to 10 do
    sum := sum + (i * i);
  writeln('Sum of squares (1 to 10): ', sum);
end.
`,
  },

  // 33. Assembly (x86_64)
  {
    id: 'assembly',
    name: 'Assembly (x86_64)',
    category: 'Systems',
    extension: 'asm',
    version: 'NASM / Gas',
    monacoMode: 'assembly',
    description: 'Low-level symbolic machine code giving absolute instruction control.',
    sampleCode: `; Haile AI - x86_64 Assembly
global _start

section .text
_start:
    ; Write message to stdout (sys_write = 1)
    mov rax, 1          ; sys_write
    mov rdi, 1          ; stdout
    mov rsi, msg        ; message pointer
    mov rdx, len        ; message length
    syscall

    ; Exit program (sys_exit = 60)
    mov rax, 60         ; sys_exit
    xor rdi, rdi        ; status code 0
    syscall

section .data
msg db "=== x86_64 Assembly Bare-Metal Code ===", 10
len equ $ - msg
`,
  },

  // 34. WebAssembly (WAT)
  {
    id: 'wasm',
    name: 'WebAssembly (WAT)',
    category: 'Web & Frontend',
    extension: 'wat',
    version: 'Wasm 2.0',
    monacoMode: 'wasm',
    description: 'Low-level stack-based virtual machine binary format for high-speed web execution.',
    sampleCode: `(module
  ;; Function: adds two 32-bit integers
  (func $add (param $lhs i32) (param $rhs i32) (result i32)
    local.get $lhs
    local.get $rhs
    i32.add)
  (export "add" (func $add))
)
;; Executed via in-browser WebAssembly runtime!
`,
  },

  // 35. HTML5 & Live Web Sandbox
  {
    id: 'html',
    name: 'HTML5 / Canvas',
    category: 'Web & Frontend',
    extension: 'html',
    version: 'HTML5 / DOM API',
    monacoMode: 'html',
    description: 'Standard markup language for documents designed to be displayed in a web browser.',
    sampleCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #09090b; color: #f4f4f5; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .badge { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: bold; margin-bottom: 12px; }
    h1 { margin: 0; font-size: 24px; color: #f59e0b; }
    button { margin-top: 16px; background: #f59e0b; color: #000; border: none; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
    button:hover { background: #d97706; }
  </style>
</head>
<body>
  <div class="badge">Live Sandbox</div>
  <h1>Haile AI Web Engine</h1>
  <p>Interactive DOM & Canvas container</p>
  <button onclick="alert('Haile AI Sandbox is running!')">Click Me</button>
</body>
</html>
`,
  },

  // 36. CSS3
  {
    id: 'css',
    name: 'CSS3',
    category: 'Web & Frontend',
    extension: 'css',
    version: 'CSS3 / Modern Grid',
    monacoMode: 'css',
    description: 'Style sheet language used for describing the presentation of a document.',
    sampleCode: `/* Haile AI - Modern Glassmorphism Card */
:root {
  --primary-accent: #f59e0b;
  --bg-gradient: radial-gradient(circle at 50% 50%, #18181b, #09090b);
}

.haile-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 16px;
  background: rgba(24, 24, 27, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  color: #f4f4f5;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.haile-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary-accent);
}
`,
  },

  // 37. SVG Graphics
  {
    id: 'svg',
    name: 'SVG Graphics',
    category: 'Web & Frontend',
    extension: 'svg',
    version: 'SVG 1.1 / 2.0',
    monacoMode: 'xml',
    description: 'XML-based vector image format for two-dimensional graphics with interactive support.',
    sampleCode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" height="100%">
  <defs>
    <linearGradient id="haileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#09090b" rx="16" />
  <circle cx="100" cy="100" r="45" fill="url(#haileGrad)" />
  <path d="M85 85 L115 85 L100 115 Z" fill="#09090b" />
  <text x="170" y="95" fill="#f4f4f5" font-family="sans-serif" font-size="22" font-weight="bold">Haile AI</text>
  <text x="170" y="125" fill="#a1a1aa" font-family="sans-serif" font-size="14">Polyglot Compiler Vector</text>
</svg>
`,
  },

  // 38. JSON / JQ
  {
    id: 'json',
    name: 'JSON / JQ Query',
    category: 'Data & Query',
    extension: 'json',
    version: 'RFC 8259',
    monacoMode: 'json',
    description: 'Lightweight data-interchange format and query syntax.',
    sampleCode: `{
  "app": "Haile AI",
  "version": "3.0",
  "features": [
    "50-Language Offline Compiler",
    "Mermaid Mindmap Visualizer",
    "Google Search Grounding",
    "Deep Reasoning Chain-of-Thought"
  ],
  "runtime": {
    "supportedLanguages": 50,
    "latency": "< 10ms",
    "sandboxed": true
  }
}
`,
  },

  // 39. Awk
  {
    id: 'awk',
    name: 'Awk',
    category: 'Scripting',
    extension: 'awk',
    version: 'GNU Awk 5+',
    monacoMode: 'awk',
    description: 'Specialized domain language tailored for data-driven text scanning and processing.',
    sampleCode: `#!/usr/bin/awk -f
# Haile AI - Awk Data Summarizer
BEGIN {
    print "=== Awk Log Data Summarizer ==="
    total_mb = 0
}
{
    total_mb += $2
    printf "%-15s : %6d MB\\n", $1, $2
}
END {
    print "-------------------------"
    printf "Total Transfer  : %6d MB\\n", total_mb
}
`,
    sampleStdin: `ServerA 450
ServerB 820
ServerC 190
ServerD 340`,
  },

  // 40. Sed
  {
    id: 'sed',
    name: 'Sed',
    category: 'Scripting',
    extension: 'sed',
    version: 'GNU Sed 4.x',
    monacoMode: 'shell',
    description: 'Stream editor for filtering and transforming text files and pipeline streams.',
    sampleCode: `# Haile AI - Sed Stream Transform
# Transforms key=value into clean markdown bullet points
s/^/ • Key: /
s/=/ -> Value: /
`,
    sampleStdin: `PORT=3000
NODE_ENV=production
AI_MODEL=gemini-3.8-flash`,
  },

  // 41. Bc (Arbitrary Precision Calculator)
  {
    id: 'bc',
    name: 'Bc Calculator',
    category: 'Data & Query',
    extension: 'bc',
    version: 'GNU Bc',
    monacoMode: 'shell',
    description: 'Arbitrary precision numeric computation and formula processing language.',
    sampleCode: `/* Haile AI - Bc Arbitrary Precision Calculator */
scale = 25

/* Compute Pi using arctangent formula: pi = 4 * a(1) */
pi = 4 * a(1)
print "Value of Pi to 25 decimal places:\n"
print pi
print "\n"

print "High precision power (2^64 - 1):\n"
print 2^64 - 1
print "\n"
quit
`,
  },

  // 42. Common Lisp
  {
    id: 'lisp',
    name: 'Common Lisp',
    category: 'Functional',
    extension: 'lisp',
    version: 'ANSI Common Lisp',
    monacoMode: 'lisp',
    description: 'Pioneering functional language with code-as-data homoiconicity and macro systems.',
    sampleCode: `;; Haile AI - Common Lisp
(defun fib (n)
  (if (< n 2)
      n
      (+ (fib (- n 1)) (fib (- n 2)))))

(format t "=== Common Lisp S-Expression Engine ===~%")
(format t "Fibonacci(10) = ~A~%" (fib 10))
(format t "List mapping: ~A~%" (mapcar (lambda (x) (* x x)) '(1 2 3 4 5)))
`,
  },

  // 43. Scheme
  {
    id: 'scheme',
    name: 'Scheme',
    category: 'Functional',
    extension: 'scm',
    version: 'R7RS / R6RS',
    monacoMode: 'scheme',
    description: 'Minimalist, elegant dialect of Lisp emphasizing clean functional semantics.',
    sampleCode: `;; Haile AI - Scheme Functional Interpreter
(define (square-sum lst)
  (if (null? lst)
      0
      (+ (* (car lst) (car lst))
         (square-sum (cdr lst)))))

(display "=== Scheme S-Expression Evaluator ===") (newline)
(display "Sum of squares of (3 4 5): ")
(display (square-sum '(3 4 5)))
(newline)
`,
  },

  // 44. Prolog
  {
    id: 'prolog',
    name: 'Prolog',
    category: 'Esoteric & Classical',
    extension: 'pl',
    version: 'ISO Prolog / SWI',
    monacoMode: 'prolog',
    description: 'Declarative logic programming language based on formal relations and unification.',
    sampleCode: `% Haile AI - Prolog Knowledge Base
parent(haile, solomon).
parent(haile, megan).
parent(solomon, ruth).
parent(solomon, eyob).

grandparent(X, Y) :- parent(X, Z), parent(Z, Y).

% Query demonstration
?- grandparent(haile, Grandchild).
`,
  },

  // 45. Forth
  {
    id: 'forth',
    name: 'Forth',
    category: 'Esoteric & Classical',
    extension: 'forth',
    version: 'ANS Forth / Gforth',
    monacoMode: 'forth',
    description: 'Stack-based concatenative language operating with Reverse Polish Notation (RPN).',
    sampleCode: `\\ Haile AI - Forth Stack Engine
: SQUARE DUP * ;
: CUBE DUP SQUARE * ;

CR .( === Forth Stack-Based Runner === ) CR
5 SQUARE . CR
3 CUBE . CR
.( Stack execution verified ) CR
`,
  },

  // 46. Brainfuck
  {
    id: 'brainfuck',
    name: 'Brainfuck',
    category: 'Esoteric & Classical',
    extension: 'bf',
    version: 'Standard 8-Op VM',
    monacoMode: 'brainfuck',
    description: 'Minimalist Turing-complete esoteric language operating with 8 single-character commands.',
    sampleCode: `+++++ +++               Set Cell #0 to 8
[
    >++++               Add 4 to Cell #1
    [
        >++             Add 2 to Cell #2
        >+++            Add 3 to Cell #3
        >+++            Add 3 to Cell #4
        >+              Add 1 to Cell #5
        <<<<-           Decrement Cell #1
    ]
    >+                  Add 1 to Cell #2
    >+                  Add 1 to Cell #3
    >-                  Sub 1 to Cell #4
    >>+                 Add 1 to Cell #6
    [<]                 Move back
    <-                  Decrement Cell #0
]
>>.                     Prints 'H'
>---.                   Prints 'e'
+++++++..+++.           Prints 'llo'
>>.                     Prints ' '
<-.                     Prints 'W'
<.                      Prints 'o'
+++.------.--------.    Prints 'rld'
>>+.                    Prints '!'
`,
  },

  // 47. Smalltalk
  {
    id: 'smalltalk',
    name: 'Smalltalk',
    category: 'Esoteric & Classical',
    extension: 'st',
    version: 'GNU Smalltalk / Pharo',
    monacoMode: 'smalltalk',
    description: 'Pioneering pure object-oriented language where everything is an object sending messages.',
    sampleCode: `"Haile AI - Smalltalk Object Engine"
Transcript show: '=== Smalltalk Pure OOP ==='; cr.

#(10 20 30 40 50) do: [ :each |
    Transcript show: 'Element: '; show: each printString; cr.
].

Transcript show: 'Sum: '; show: (#(10 20 30 40 50) sum) printString; cr.
`,
  },

  // 48. TCL
  {
    id: 'tcl',
    name: 'TCL',
    category: 'Scripting',
    extension: 'tcl',
    version: '8.6+',
    monacoMode: 'tcl',
    description: 'Tool Command Language for embedded control, scripting, and GUI rapid prototyping.',
    sampleCode: `# Haile AI - TCL Script Runner
puts "=== Tool Command Language (TCL) ==="

set greeting "Hello from TCL"
set count 4

for {set i 1} {$i <= $count} {incr i} {
    puts "Iteration $i: $greeting"
}
`,
  },

  // 49. COBOL
  {
    id: 'cobol',
    name: 'COBOL',
    category: 'Esoteric & Classical',
    extension: 'cbl',
    version: 'COBOL 2002 / GnuCOBOL',
    monacoMode: 'cobol',
    description: 'Historic English-like language powering mission-critical financial and banking systems.',
    sampleCode: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HAILE-COBOL.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-TRANSACTION-AMT PIC 9(5)V99 VALUE 12500.50.
       01 WS-FEE-PCT        PIC 9V99 VALUE 0.02.
       01 WS-FEE-TOTAL      PIC 9(4)V99.
       PROCEDURE DIVISION.
           DISPLAY "=== COBOL Financial Transaction System ===".
           COMPUTE WS-FEE-TOTAL = WS-TRANSACTION-AMT * WS-FEE-PCT.
           DISPLAY "TRANSACTION: $" WS-TRANSACTION-AMT.
           DISPLAY "PROCESSING FEE: $" WS-FEE-TOTAL.
           STOP RUN.
`,
  },

  // 50. CoffeeScript
  {
    id: 'coffeescript',
    name: 'CoffeeScript',
    category: 'Web & Frontend',
    extension: 'coffee',
    version: '2.x',
    monacoMode: 'coffeescript',
    description: 'Golden-era elegant language that transpiles directly into clean JavaScript.',
    sampleCode: `# Haile AI - CoffeeScript Transpiler
console.log "=== CoffeeScript Elegant Transpiler ==="

cube = (x) -> x * x * x
race = (winner, runners...) ->
  console.log "Winner: #{winner}"
  console.log "Others: #{runners.join(', ')}"

race "Haile", "Alpha", "Beta", "Gamma"
console.log "Cube of 4 is #{cube 4}"
`,
  },

  // 51. GraphQL
  {
    id: 'graphql',
    name: 'GraphQL',
    category: 'Data & Query',
    extension: 'graphql',
    version: 'October 2021 Spec',
    monacoMode: 'graphql',
    description: 'Query language for APIs giving clients exact control over data fetching.',
    sampleCode: `# Haile AI - GraphQL Query & Schema Validator
query GetHaileAssistantWorkspace {
  session(id: "active-session-01") {
    title
    createdAt
    activePersona {
      id
      name
      temperature
    }
    offlineCompiler {
      languagesCount
      executionModes
    }
  }
}
`,
  },

  // 52. YAML / TOML
  {
    id: 'yaml',
    name: 'YAML / Config',
    category: 'Data & Query',
    extension: 'yaml',
    version: 'YAML 1.2',
    monacoMode: 'yaml',
    description: 'Human-friendly data serialization language commonly used for modern DevOps pipelines.',
    sampleCode: `# Haile AI - Polyglot Cloud Pipeline
version: "3.8"
metadata:
  app: "Haile AI Studio"
  tier: "Enterprise Cloud"
  languages_supported: 50
services:
  polyglot_compiler:
    image: "haile/compiler-sandbox:3.0"
    ports:
      - "3000:3000"
    environment:
      - OFFLINE_MODE=true
      - EXECUTION_TIMEOUT_MS=8000
`,
  },
];
