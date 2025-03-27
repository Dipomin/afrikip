import React from "react";

export default function getTime(time: any) {
  let ta = time.trim().split("");
  let slots = ta[0].split(":");
  while (slots.length < 3) slots.push("");
  return (
    slots.map((n: any) => n.padStart(2, "0")).join(":") +
    " " +
    (ta.length > 1 ? ta[1].trim().toUpperCase() : "")
  );
}
