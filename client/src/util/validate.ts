import React from "react";

export function validateEmailDomain(
  e: React.FormEvent<HTMLInputElement>
) {
    const target = e.currentTarget;
    const email = target.value;
    // Only set the error if the field is not empty
    if (email && !email.endsWith("@ufl.edu")) {
      target.setCustomValidity("UF email required.");
    } else {
      target.setCustomValidity("");
    }
}


export function validateVerificationCode(
  e: React.FormEvent<HTMLInputElement>
) {
  console.error("Ran validateVerificationCode");
  const target = e.currentTarget;
  const code = target.value;
  // Only set the error if the field is not empty and doesn't match 6 digits
  if (code && !/^\d{6}$/.test(code)) {
    target.setCustomValidity("Verification code must be 6 digits.");
  } else {
    target.setCustomValidity("");
  }
}
