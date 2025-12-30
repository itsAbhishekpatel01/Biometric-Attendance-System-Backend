import { Router } from "express";

const router = Router();

router.post("/login", async (req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/ce8c5969-e772-4fa2-a8ed-1cee37b6f6fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.routes.ts:8',message:'Login route reached',data:{method:req.method,origin:req.headers.origin,host:req.headers.host,hasBody:!!req.body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  try {
    const { password } = req.body;

    if (!password) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/ce8c5969-e772-4fa2-a8ed-1cee37b6f6fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.routes.ts:12',message:'Login route - missing password',data:{origin:req.headers.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return res.status(400).json({ message: "Password is required" });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/ce8c5969-e772-4fa2-a8ed-1cee37b6f6fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.routes.ts:17',message:'Login route - invalid password',data:{origin:req.headers.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return res.status(401).json({ message: "Invalid password" });
    }

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/ce8c5969-e772-4fa2-a8ed-1cee37b6f6fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.routes.ts:22',message:'Login route - success',data:{origin:req.headers.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return res.json({ token: password, success: true });
  } catch (error) {
    console.error("Login error:", error);
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/ce8c5969-e772-4fa2-a8ed-1cee37b6f6fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.routes.ts:26',message:'Login route - exception',data:{error:error instanceof Error?error.message:String(error),origin:req.headers.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return res.status(500).json({ message: "Login failed" });
  }
});

export default router;
