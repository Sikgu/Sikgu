import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

// Configure session middleware
const MemoryStoreConstructor = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreConstructor({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
    name: 'sessionId'
  }));

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).send("이미 사용 중인 아이디입니다.");
      }

      // Create new user
      const newUser = await storage.createUser(validatedData);
      res.status(201).json({ id: newUser.id, username: newUser.username });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).send("회원가입 중 오류가 발생했습니다.");
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).send("아이디와 비밀번호를 입력해주세요.");
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).send("아이디 또는 비밀번호가 올바르지 않습니다.");
      }

      // Set session
      (req.session as any).userId = user.id;
      console.log("Setting session for user:", user.id);
      console.log("Session ID after login:", req.sessionID);
      
      // Force session regeneration to ensure new session ID
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).send("세션 생성 중 오류가 발생했습니다.");
        }
        
        (req.session as any).userId = user.id;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).send("세션 저장 중 오류가 발생했습니다.");
          }
          console.log("Session saved successfully with ID:", req.sessionID);
          res.json({ id: user.id, username: user.username });
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send("로그인 중 오류가 발생했습니다.");
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("로그아웃 중 오류가 발생했습니다.");
      }
      res.clearCookie('sessionId');
      res.json({ message: "로그아웃되었습니다." });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      console.log("Session ID:", req.sessionID);
      console.log("Session data:", req.session);
      console.log("User ID from session:", (req.session as any)?.userId);
      
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).send("로그인이 필요합니다.");
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).send("사용자를 찾을 수 없습니다.");
      }

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).send("사용자 정보를 가져오는 중 오류가 발생했습니다.");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
