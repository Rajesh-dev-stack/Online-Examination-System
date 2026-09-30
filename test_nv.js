const fetch = require('node-fetch'); // wait, fetch is built-in in node 18+

async function test() {
  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [{role: 'user', content: 'hello'}],
        max_tokens: 10
      })
    });
    
    console.log(response.status);
    const data = await response.text();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
test();
