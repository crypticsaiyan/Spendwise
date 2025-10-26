const asyncHandler =
  (fn: Function) => async (req: any, res: any, next: any) => {
    try {
      await fn(req, res, next);
    } catch (err: any) {
      res.status(err.code || 500).json({success: false, message: err.message || "Server Error"});
    }
  };

export default asyncHandler;