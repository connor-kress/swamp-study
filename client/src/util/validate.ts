import React from "react";

export function validateEmailDomain(e: React.FormEvent<HTMLInputElement>) {
    const target = e.currentTarget;
    const email = target.value;
    // Only set the error if the field is not empty
    if (email && !email.endsWith("@ufl.edu")) {
      target.setCustomValidity(
        "UF email required."
      );
    } else {
      target.setCustomValidity("");
    }
}
