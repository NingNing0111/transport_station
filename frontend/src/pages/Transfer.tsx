import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getTransfer, type TransferInfo } from '../lib/api';
import { Download, FileText, MessageSquare, AlertCircle } from 'lucide-react';

export default function Transfer() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [transferInfo, setTransferInfo] = useState<TransferInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const visitCode = searchParams.get('visitCode');
    if (!shortCode || !visitCode) {
      setError('缺少必要参数');
      setLoading(false);
      return;
    }

    loadTransfer();
  }, [shortCode, searchParams]);

  const loadTransfer = async () => {
    const visitCode = searchParams.get('visitCode');
    if (!shortCode || !visitCode) return;

    try {
      const info = await getTransfer(shortCode, visitCode);
      setTransferInfo(info);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('访问码错误');
      } else if (err.response?.status === 404) {
        setError('资源不存在');
      } else if (err.response?.status === 410) {
        setError('资源已过期');
      } else {
        setError('加载失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-center text-red-600">错误</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transferInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          {transferInfo.type === 'file' ? (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <CardTitle>文件下载</CardTitle>
              </div>
              <CardDescription>
                文件名: {transferInfo.file_name} ({formatFileSize(transferInfo.file_size || 0)})
              </CardDescription>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="h-8 w-8 text-green-600" />
                <CardTitle>消息内容</CardTitle>
              </div>
              <CardDescription>查看消息内容</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {transferInfo.type === 'file' ? (
            <>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-2">文件信息</p>
                <p className="font-medium">{transferInfo.file_name}</p>
                <p className="text-sm text-gray-500">
                  大小: {formatFileSize(transferInfo.file_size || 0)} |
                  类型: {transferInfo.mime_type}
                </p>
              </div>
              {transferInfo.download_url && (
                <a href={transferInfo.download_url} download>
                  <Button className="w-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    下载文件
                  </Button>
                </a>
              )}
            </>
          ) : (
            <>
              <div className="p-4 bg-gray-50 rounded-md min-h-[200px]">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: transferInfo.content || '' }}
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 text-center">
              过期时间: {new Date(transferInfo.expires_at).toLocaleString('zh-CN')}
            </p>
          </div>

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
  );
}
