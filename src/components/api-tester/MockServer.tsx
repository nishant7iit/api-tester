import React, { useState } from 'react';
/* MSW imports removed to restore app
import { setupWorker } from 'msw/browser';
import { rest } from 'msw';
*/
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { faker } from '@faker-js/faker';

const MockServer: React.FC = () => {
  const [isMockEnabled, setIsMockEnabled] = useState(false);
  const [endpoints, setEndpoints] = useState<{ path: string; response: string }[]>([]);
  const [newEndpoint, setNewEndpoint] = useState({ path: '', response: '' });

  // MSW logic removed to restore app
  // const worker = setupWorker();

  const toggleMock = () => {
    setIsMockEnabled(!isMockEnabled);
    // if (!isMockEnabled) {
    //   worker.start();
    // } else {
    //   worker.stop();
    // }
  };

  const addEndpoint = () => {
    setEndpoints([...endpoints, newEndpoint]);
    // worker.use(
    //   rest.get(newEndpoint.path, (req, res, ctx) => {
    //     const dynamicResponse = newEndpoint.response.includes('{{random}}')
    //       ? newEndpoint.response.replace('{{random}}', faker.word.sample())
    //       : newEndpoint.response;
    //     return res(ctx.json({ message: dynamicResponse }));
    //   })
    // );
    setNewEndpoint({ path: '', response: '' });
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <div className="flex items-center mb-4">
        <Switch checked={isMockEnabled} onChange={toggleMock} />
        <span className="ml-2">Enable Mock Server</span>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">Add New Endpoint</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Endpoint Path (e.g., /api/test)"
            value={newEndpoint.path}
            onChange={(e) => setNewEndpoint({ ...newEndpoint, path: e.target.value })}
          />
          <Input
            placeholder="Response (use {{random}} for dynamic data)"
            value={newEndpoint.response}
            onChange={(e) => setNewEndpoint({ ...newEndpoint, response: e.target.value })}
          />
          <Button onClick={addEndpoint}>Add</Button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2">Defined Endpoints</h3>
        <ul>
          {endpoints.map((endpoint, index) => (
            <li key={index} className="mb-2">
              <strong>Path:</strong> {endpoint.path} <br />
              <strong>Response:</strong> {endpoint.response}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MockServer;