import { zip, type Zippable } from "fflate";

function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(name)) return name;
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let i = 1;
  let candidate = `${base} (${i})${ext}`;
  while (used.has(candidate)) {
    i++;
    candidate = `${base} (${i})${ext}`;
  }
  return candidate;
}

export async function zipFiles(files: File[]): Promise<File> {
  const entries: Zippable = {};
  const used = new Set<string>();

  for (const file of files) {
    const name = uniqueName(file.name, used);
    used.add(name);
    entries[name] = new Uint8Array(await file.arrayBuffer());
  }

  const zipped = await new Promise<Uint8Array>((resolve, reject) => {
    zip(entries, { level: 6 }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  return new File([new Uint8Array(zipped)], "files.zip", { type: "application/zip" });
}
