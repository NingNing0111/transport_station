import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Header from '../components/Header';
import { Lock } from 'lucide-react';

export default function Access() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [visitCode, setVisitCode] = useState(searchParams.get('visitCode') || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visitCode && shortCode) {
      handleAccess();
    }
  }, []);

  const handleAccess = () => {
    if (!visitCode.trim()) {
      setError('请输入访问码');
      return;
    }

    if (shortCode) {
      navigate(`/transfer/${shortCode}?visitCode=${visitCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Header />
      <div className="flex items-center justify-center p-4 py-12">
        <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-center">需要访问码</CardTitle>
          <CardDescription className="text-center">
            请输入访问码以查看资源
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">访问码</label>
            <Input
              type="text"
              value={visitCode}
              onChange={(e) => {
                setVisitCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="请输入访问码"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAccess();
                }
              }}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button
            onClick={handleAccess}
            className="w-full"
            size="lg"
          >
            访问
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            返回首页
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
