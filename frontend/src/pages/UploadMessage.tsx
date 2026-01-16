import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import Header from '../components/Header';
import { uploadMessage } from '../lib/api';
import { MessageSquare, CheckCircle, Copy } from 'lucide-react';

export default function UploadMessage() {
  const [content, setContent] = useState('');
  const [expiration, setExpiration] = useState('10m');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ short_link: string; visit_code: string } | null>(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!content.trim()) return;

    setUploading(true);
    try {
      const response = await uploadMessage(content, expiration);
      setResult({
        short_link: response.short_link,
        visit_code: response.visit_code,
      });
    } catch (error) {
      alert('上传失败，请重试');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  // 生成包含visitorCode的完整链接
  const getFullLink = (shortLink: string, visitCode: string) => {
    const url = new URL(shortLink);
    url.searchParams.set('visitCode', visitCode);
    return url.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Header />
      <div className="flex items-center justify-center p-4 py-12">
        <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>上传消息</CardTitle>
          <CardDescription>输入富文本内容并设置过期时间，生成阅读码和短链接</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">消息内容</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="输入您的消息内容..."
                  rows={10}
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">过期时间</label>
                <Select value={expiration} onChange={(e) => setExpiration(e.target.value)}>
                  <option value="10m">10分钟</option>
                  <option value="1h">1小时</option>
                  <option value="1d">1天</option>
                  <option value="7d">7天</option>
                </Select>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!content.trim() || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    上传消息
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">上传成功！</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">短链接（包含阅读码）</label>
                <div className="flex space-x-2">
                  <Input value={getFullLink(result.short_link, result.visit_code)} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(getFullLink(result.short_link, result.visit_code))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">阅读码</label>
                <div className="flex space-x-2">
                  <Input value={result.visit_code} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(result.visit_code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setContent('');
                  }}
                  className="flex-1"
                >
                  继续上传
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  返回首页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
