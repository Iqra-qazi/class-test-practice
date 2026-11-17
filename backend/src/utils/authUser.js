export function serializeAuthUser(user) {
  const value = typeof user.toObject === "function" ? user.toObject() : user;

  return {
    id: String(value._id ?? value.id),
    name: value.name ?? value.username ?? "",
    email: value.email,
    role: value.role ?? "patient",
    picture: value.picture ?? null,
    specialization: value.specialization ?? "",
    experience: value.experience ?? 0,
  };
}
