declare module '*.yaml' {
  const contents: any;
  export default contents;
}

declare module '*.svg' {
  const contents: string;
  export default contents;
}

declare module '*.png' {
  const contents: string;
  export default contents;
}

declare module '*.gif' {
  const contents: string;
  export default contents;
}

declare module '*.less' {
  const contents: { [key: string]: string | undefined };
  export default contents;
}
