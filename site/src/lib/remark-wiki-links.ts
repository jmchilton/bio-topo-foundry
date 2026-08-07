import { contentReader } from "./content-reader";

export default function remarkWikiLinksPlugin({
  base = "",
}: { base?: string } = {}) {
  return contentReader.remarkWikiLinks({ base });
}
