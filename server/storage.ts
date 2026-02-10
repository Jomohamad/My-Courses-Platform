import { type User, type InsertUser } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables for server storage");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * IStorage implementation using Supabase.
 * This project uses a `users` table (id, username, password) per shared/schema.ts (drizzle).
 * - createUser inserts into `users`.
 * - getUser and getUserByUsername read from `users`.
 */
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ?? undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ?? undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert({
        username: insertUser.username,
        password: insertUser.password,
      })
      .select()
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error("Failed to insert user");
    }

    return data as User;
  }
}

export const storage = new SupabaseStorage();