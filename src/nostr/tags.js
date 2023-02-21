export function findTags(tags, tag) {
  return tags.filter((t) => t[0] === tag).map((t) => t[1]);
}

export function findTag(tags, tag) {
  return tags.find((t) => t[0] === tag)?.at(1);
}
