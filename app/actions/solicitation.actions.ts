// ============================================
// FILE: app/actions/solicitation.actions.ts
// ============================================
"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5004/api/v1";

// ========================================
// CREATE DOCUMENT
// ========================================
export const createSolicitationDoc = async (data: { title: string }) => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "Not authenticated" };
        }

        const res = await fetch(`${BASE_API}/solicitation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        console.log("result", result)
        if (res.ok) {
            return { success: true, data: result.data };
        }

        return { success: false, message: result.message };
    } catch (error: any) {
        console.error("Error creating document:", error);
        return { success: false, message: error.message || "Failed to create document" };
    }
};

// ========================================
// GET TEAM DOCUMENTS
// ========================================
export const getTeamDocs = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "Not authenticated" };
        }

        const res = await fetch(`${BASE_API}/solicitation/teams-solicitation-docs`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: {
                tags: ["SolicitationDocs"],
            },
        });

        const result = await res.json();
        console.log("getTeamDocs", result)
        if (res.ok) {
            return result
        }

        return { success: false, message: result.message };
    } catch (error: any) {
        console.error("Error fetching team docs:", error);
        return { success: false, message: error.message || "Failed to fetch documents" };
    }
};

// ========================================
// GET SINGLE DOCUMENT
// ========================================
export const getSolicitationDoc = async (docId: string) => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "Not authenticated" };
        }

        const res = await fetch(`${BASE_API}/solicitation/${docId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        const result = await res.json();

        if (res.ok) {
            return result
        }

        return { success: false, message: result.message };
    } catch (error: any) {
        console.error("Error fetching document:", error);
        return { success: false, message: error.message || "Failed to fetch document" };
    }
};

// ========================================
// DELETE DOCUMENT
// ========================================
export const deleteSolicitationDoc = async (docId: string) => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "Not authenticated" };
        }

        const res = await fetch(`${BASE_API}/solicitation/${docId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = await res.json();

        if (res.ok) {
            // revalidateTag("SolicitationDocs");
            return { success: true, message: "Document deleted successfully" };
        }

        return { success: false, message: result.message };
    } catch (error: any) {
        console.error("Error deleting document:", error);
        return { success: false, message: error.message || "Failed to delete document" };
    }
};

// ========================================
// GET COMMENTS
// ========================================
export const getDocComments = async (docId: string) => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "Not authenticated" };
        }

        const res = await fetch(`${BASE_API}/comment/solicitation/${docId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        const result = await res.json();
        // console.log("getDocComments", result)
        if (res.ok) {
            return { success: true, data: result.result };
        }

        return { success: false, message: result.message };
    } catch (error: any) {
        console.error("Error fetching comments:", error);
        return { success: false, message: error.message || "Failed to fetch comments" };
    }
};

// ========================================
// GET USER INFO (Helper)
// ========================================
export const getUserInfo = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "Not authenticated" };
        }

        const res = await fetch(`${BASE_API}/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        const result = await res.json();
        console.log("result", result)
        if (res.ok) {
            return { success: true, result: result.result };
        }

        return { success: false, message: result.message };
    } catch (error: any) {
        console.error("Error fetching user info:", error);
        return { success: false, message: error.message || "Failed to fetch user info" };
    }
};