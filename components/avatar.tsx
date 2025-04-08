import Image from "next/image";

export default function Avatar({ author }) {
  const isAuthorHaveFullName =
    author?.node?.firstName && author?.node?.lastName;
  const name = isAuthorHaveFullName
    ? `${author.node.firstName} ${author.node.lastName}`
    : author.node?.name || null || "";

  //console.log("AUTEUR", author.node.name);

  return (
    <div className="flex items-center">
      <div>{author.node?.name}</div>
    </div>
  );
}
