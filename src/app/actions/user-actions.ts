'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { DeleteUserInput, DeleteUserOutput, SetUserRoleInput, SetUserRoleOutput } from "@/lib/types";
import { revalidatePath } from 'next/cache';

/**
 * Server Action to delete a user from Firebase Authentication and Firestore.
 * This can only be called from a server-side context that has properly authenticated an admin user.
 * @param input The user ID to delete.
 * @returns The result of the deletion operation.
 */
export async function deleteUser(input: DeleteUserInput): Promise<DeleteUserOutput> {
  // TODO: Add a check here to ensure the CALLER of this action is an admin.
  // This would typically involve verifying a session cookie or JWT passed from the client.
  try {
    // 1. Delete from Firebase Authentication
    await adminAuth.deleteUser(input.userId);

    // 2. Delete from Firestore
    const userDocRef = adminDb.collection('users').doc(input.userId);
    await userDocRef.delete();

    revalidatePath('/admin/users');

    return {
      success: true,
      message: `Successfully deleted user ${input.userId}.`,
    };
  } catch (error: any) {
    console.error("Error in deleteUser action:", error);
    let message = 'An unknown error occurred while deleting the user.';

    if (error.code === 'auth/user-not-found') {
      message = 'User not found in Firebase Authentication. They may have already been deleted.';
    } else if (error.codePrefix === 'auth/') {
      message = 'An authentication-related error occurred.';
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      message: `Failed to delete user: ${message}`,
    };
  }
}

/**
 * Server Action to set a user's custom role claim in Firebase Authentication.
 * This can only be called from a server-side context that has properly authenticated an admin user.
 * @param input The user ID and the role to set.
 * @returns The result of the role setting operation.
 */
export async function setUserRole(input: SetUserRoleInput): Promise<SetUserRoleOutput> {
  // TODO: Add a check here to ensure the CALLER of this action is an admin.
  try {
    if (!adminAuth) {
      console.error("CRITICAL: adminAuth is undefined in setUserRole action");
      return {
        success: false,
        message: "Internal Server Error: Firebase Admin not initialized.",
        debug: "adminAuth is undefined"
      };
    }

    console.log(`Attempting to set role ${input.role} for user ${input.userId}`);

    // 1. Check if the user being modified exists
    await adminAuth.getUser(input.userId);

    // 2. Set the custom claim in Authentication
    await adminAuth.setCustomUserClaims(input.userId, { role: input.role });

    // 3. Update the role in the Firestore document for consistency
    const userDocRef = adminDb.collection('users').doc(input.userId);
    await userDocRef.update({ role: input.role });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: `Successfully set role '${input.role}' for user ${input.userId}.`,
    };
  } catch (error: any) {
    console.error('Error in setUserRole action:', error);
    let message = 'An unknown error occurred.';

    if (error.code === 'auth/user-not-found') {
      message = `User with ID ${input.userId} not found.`;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      message: `Failed to set user role: ${message}`,
      debug: JSON.stringify(error)
    };
  }
}
