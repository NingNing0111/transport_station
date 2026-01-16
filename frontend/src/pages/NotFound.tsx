import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Header from '../components/Header';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="flex items-center justify-center p-4 py-12">
        <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-gray-600" />
          </div>
          <CardTitle className="text-center">404</CardTitle>
          <CardDescription className="text-center">
            资源不存在
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/')} className="w-full">
            返回首页
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
