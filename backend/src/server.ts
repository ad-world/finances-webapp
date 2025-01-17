type Handler = (req: Request) => Promise<Response> | Response;
type RouteMap = Map<string, Handler>;

export class Server {
  private routes: {
    GET: RouteMap;
    POST: RouteMap;
    PUT: RouteMap;
    DELETE: RouteMap;
    PATCH: RouteMap;
    OPTIONS: RouteMap;  // Added for CORS preflight
  };
  private port: number;
  private corsOptions: {
    origin: string | string[] | ((origin: string) => boolean);
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
  };

  constructor(port: number = 8000) {
    this.port = port;
    this.routes = {
      GET: new Map(),
      POST: new Map(),
      PUT: new Map(),
      DELETE: new Map(),
      PATCH: new Map(),
      OPTIONS: new Map(),
    };
    // Default CORS options
    this.corsOptions = {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: false,
      maxAge: 86400, // 24 hours
    };
  }

  public configureCors(options: Partial<typeof this.corsOptions>): void {
    this.corsOptions = { ...this.corsOptions, ...options };
  }

  private isOriginAllowed(requestOrigin: string): boolean {
    const { origin } = this.corsOptions;
    
    if (origin === "*") return true;
    if (typeof origin === "string") return origin === requestOrigin;
    if (Array.isArray(origin)) return origin.includes(requestOrigin);
    if (typeof origin === "function") return origin(requestOrigin);
    
    return false;
  }

  private setCorsHeaders(req: Request, response: Response): Response {
    const requestOrigin = req.headers.get("origin");
    const headers = new Headers(response.headers);
    
    if (requestOrigin && this.isOriginAllowed(requestOrigin)) {
      headers.set("Access-Control-Allow-Origin", requestOrigin);
      
      if (this.corsOptions.credentials) {
        headers.set("Access-Control-Allow-Credentials", "true");
      }
      
      if (this.corsOptions.exposedHeaders?.length) {
        headers.set("Access-Control-Expose-Headers", this.corsOptions.exposedHeaders.join(", "));
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  private createPreflightResponse(req: Request): Response {
    const requestOrigin = req.headers.get("origin");
    
    if (!requestOrigin || !this.isOriginAllowed(requestOrigin)) {
      return new Response(null, { status: 403 });
    }

    const headers = new Headers({
      "Access-Control-Allow-Origin": requestOrigin,
      "Access-Control-Allow-Methods": this.corsOptions.methods!.join(", "),
      "Access-Control-Allow-Headers": this.corsOptions.allowedHeaders!.join(", "),
      "Access-Control-Max-Age": this.corsOptions.maxAge!.toString(),
    });

    if (this.corsOptions.credentials) {
      headers.set("Access-Control-Allow-Credentials", "true");
    }

    return new Response(null, { status: 204, headers });
  }

  private async handleRequest(req: Request): Promise<Response> {
    const path = new URL(req.url).pathname;
    const method = req.method;

    // Handle CORS preflight requests
    if (method === "OPTIONS") {
      return this.createPreflightResponse(req);
    }

    const handler = this.routes[method as keyof typeof this.routes]?.get(path);

    if (!handler) {
      return new Response("Not Found", { status: 404 });
    }

    try {
      const response = await handler(req);
      return this.setCorsHeaders(req, response);
    } catch (error) {
      console.error("Error handling request:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  // Rest of the methods (get, post, put, delete, patch, start) remain the same
  public get(path: string, handler: Handler): void {
    this.routes.GET.set(path, handler);
  }

  public post(path: string, handler: Handler): void {
    this.routes.POST.set(path, handler);
  }

  public put(path: string, handler: Handler): void {
    this.routes.PUT.set(path, handler);
  }

  public delete(path: string, handler: Handler): void {
    this.routes.DELETE.set(path, handler);
  }

  public patch(path: string, handler: Handler): void {
    this.routes.PATCH.set(path, handler);
  }

  public start(): void {
    console.log(`Server running on http://localhost:${this.port}`);
    
    Bun.serve({
      port: this.port,
      fetch: (req) => this.handleRequest(req)
    });
  }
}