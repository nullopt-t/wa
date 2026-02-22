import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const { method, url, body, query, params, user } = request;
    const startTime = Date.now();

    // Log incoming request
    console.log('\n' + '='.repeat(80));
    console.log(`📥 [REQUEST] ${method} ${url}`);
    console.log('='.repeat(80));
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`🔑 User: ${user?.userId || 'Anonymous'}`);
    console.log(`📍 IP: ${request.ip}`);
    
    if (Object.keys(params).length > 0) {
      console.log(`📌 Params:`, params);
    }
    
    if (Object.keys(query).length > 0) {
      console.log(`🔍 Query:`, query);
    }
    
    if (body && Object.keys(body).length > 0) {
      console.log(`📦 Body:`, JSON.stringify(body, null, 2));
    }
    
    console.log('='.repeat(80) + '\n');

    // Log outgoing response
    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        console.log('\n' + '='.repeat(80));
        console.log(`📤 [RESPONSE] ${method} ${url}`);
        console.log('='.repeat(80));
        console.log(`⏰ Duration: ${duration}ms`);
        console.log(`📊 Status: ${statusCode}`);
        
        if (data) {
          const dataSize = JSON.stringify(data).length;
          console.log(`💾 Size: ${dataSize} bytes`);
          
          // Log response data (truncate if too large)
          if (dataSize < 1000) {
            console.log(`📦 Data:`, JSON.stringify(data, null, 2));
          } else {
            console.log(`📦 Data: [Large response - ${dataSize} bytes]`);
            console.log(`First 500 chars:`, JSON.stringify(data).substring(0, 500) + '...');
          }
        }
        
        console.log('='.repeat(80) + '\n');
      }),
    );
  }
}
