const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const faker = require('faker');
const uuid = require('uuid');
const router = new Router();
const app = new Koa();

app.use(koaBody({
    urlencoded: true,
    multipart: true,
    json: true,
    text: true,
}));

app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
      return await next();
    }

    const headers = { 'Access-Control-Allow-Origin': '*', };

    if (ctx.request.method !== 'OPTIONS') {
      ctx.response.set({...headers});
      try {
        return await next();
      } catch (e) {
        e.headers = {...e.headers, ...headers};
        throw e;
      }
    }

    if (ctx.request.get('Access-Control-Request-Method')) {
      ctx.response.set({
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
      });

      if (ctx.request.get('Access-Control-Request-Headers')) {
        ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
      }

      ctx.response.status = 204;
    }
});

router.get('/messages/unread', async (ctx, next) => {
    const messagebox = {
        status: 'ok',
        timestamp: Date.now(),
        messages: [],
    };

    const count = Math.floor(Math.random() * 2);

    for (let i = 0; i < count; i++) {
        messagebox.messages.push({
            id: uuid.v4(),
            from: faker.internet.email(),
            subject: `Hello from ${faker.internet.userName()}`,
            body: faker.lorem.text(),
            received: Date.now(),
        });
    }
    ctx.response.body = messagebox;
});
app.use(router.routes()).use(router.allowedMethods());
const server = http.createServer(app.callback());
const port = process.env.PORT || 7070;
server.listen(port);
