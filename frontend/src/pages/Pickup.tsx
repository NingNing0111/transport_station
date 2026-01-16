import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Header from '../components/Header';
import { PackageSearch } from 'lucide-react';

export default function Pickup() {
  const [shortCode, setShortCode] = useState('');
  const [visitorCode, setVisitorCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePickup = () => {
    if (!shortCode.trim()) {
      setError('请输入短链代码');
      return;
    }
    if (!visitorCode.trim()) {
      setError('请输入取件码');
      return;
    }

    // 跳转到取件页面，使用短链代码和取件码
    navigate(`/transfer/${shortCode.trim()}?visitCode=${visitorCode.trim()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Header />
      <div className="flex items-center justify-center p-4 py-12">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <PackageSearch className="h-12 w-12 text-purple-600" />
            </div>
            <CardTitle className="text-center">取件</CardTitle>
            <CardDescription className="text-center">
              请输入短链代码和取件码以获取对应的内容
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">短链代码</label>
              <Input
                type="text"
                value={shortCode}
                onChange={(e) => {
                  setShortCode(e.target.value);
                  setError('');
                }}
                placeholder="请输入短链代码"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePickup();
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">取件码</label>
              <Input
                type="text"
                value={visitorCode}
                onChange={(e) => {
                  setVisitorCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="请输入取件码"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePickup();
                  }
                }}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              onClick={handlePickup}
              className="w-full"
              size="lg"
            >
              取件
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
