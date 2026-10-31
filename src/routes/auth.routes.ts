import { Router } from "express";

const router = Router();

const signupResponse = (req: any, res: any) => {
  res.status(200).json({
    success: true,
    requestID: req.requestId,
    message: "Signup route ready",
  });
};

router.get("/signup", signupResponse);
router.post("/signup", signupResponse);
router.get("/auth/signup", signupResponse);
router.post("/auth/signup", signupResponse);

export default router;