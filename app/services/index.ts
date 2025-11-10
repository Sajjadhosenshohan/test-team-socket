"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export const createCategory = async (data: FormData) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/category`, {
    method: "POST",
    headers: {
      Authorization: (await cookies()).get("accessToken")!.value,
    },
    body: data,
  });

  const result = await res.json();
  return result;
};

export const getCategories = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/category`,{
      next:{
        tags: ["Categories"]
      }
    });
    const result = await res.json();
    return result;
  } catch (error:any) {
    return Error(error)
  }
};
export const deleteCategory = async (id:string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/category/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: (await cookies()).get("accessToken")!.value,
      },
    });
    const result = await res.json();
    return result;
  } catch (error:any) {
    return Error(error)
  }
};