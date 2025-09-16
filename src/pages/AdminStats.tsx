import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Heart, Mail, TrendingUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface StatsData {
  totalUsers: number;
  completedProfiles: number;
  totalCrushes: number;
  emailsSent: number;
  recentSignups: number;
  premiumUsers: number;
}

const AdminStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Accès refusé",
          description: "Vous devez être connecté",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // Vérifier le rôle admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        toast({
          title: "Accès refusé", 
          description: "Seuls les administrateurs peuvent accéder à cette page",
          variant: "destructive"
        });
        navigate('/home');
        return;
      }

      setIsAdmin(true);
      await fetchStats();
    } catch (error) {
      console.error('Erreur vérification admin:', error);
      navigate('/home');
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Récupérer les statistiques en parallèle
      const [
        usersResult,
        profilesResult,
        crushesResult,
        emailsResult,
        recentSignupsResult,
        premiumResult
      ] = await Promise.all([
        // Total utilisateurs
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        // Profils complétés
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_completed', true),
        // Total crushes
        supabase.from('crushes').select('*', { count: 'exact', head: true }),
        // Emails envoyés
        supabase.from('crushes').select('*', { count: 'exact', head: true }).eq('email_sent', true),
        // Inscriptions récentes (7 derniers jours)
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        // Utilisateurs premium
        supabase.from('subscription_offered').select('*', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        completedProfiles: profilesResult.count || 0,
        totalCrushes: crushesResult.count || 0,
        emailsSent: emailsResult.count || 0,
        recentSignups: recentSignupsResult.count || 0,
        premiumUsers: premiumResult.count || 0
      });
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-fabdive-button border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-fabdive-text">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/home')}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-white">
              📊 Statistiques Fabdive
            </h1>
          </div>
          <Button 
            onClick={fetchStats}
            className="bg-white/10 text-white hover:bg-white/20"
          >
            Actualiser
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Utilisateurs inscrits
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalUsers}</div>
              <p className="text-xs text-white/70">
                Total des comptes créés
              </p>
            </CardContent>
          </Card>

          {/* Completed Profiles */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Profils complétés
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.completedProfiles}</div>
              <p className="text-xs text-white/70">
                {stats?.totalUsers ? Math.round((stats.completedProfiles / stats.totalUsers) * 100) : 0}% de completion
              </p>
            </CardContent>
          </Card>

          {/* Total Crushes */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Crushes envoyés
              </CardTitle>
              <Heart className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalCrushes}</div>
              <p className="text-xs text-white/70">
                Interactions totales
              </p>
            </CardContent>
          </Card>

          {/* Emails Sent */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Emails envoyés
              </CardTitle>
              <Mail className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.emailsSent}</div>
              <p className="text-xs text-white/70">
                Notifications d'amour
              </p>
            </CardContent>
          </Card>

          {/* Recent Signups */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Nouveaux (7j)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.recentSignups}</div>
              <p className="text-xs text-white/70">
                Inscriptions récentes
              </p>
            </CardContent>
          </Card>

          {/* Premium Users */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Utilisateurs Premium
              </CardTitle>
              <Users className="h-4 w-4 text-gold-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.premiumUsers}</div>
              <p className="text-xs text-white/70">
                Abonnements actifs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Informations système</CardTitle>
            <CardDescription className="text-white/70">
              Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-white/80">
            <div className="space-y-2">
              <p>• Taux de conversion profil: {stats?.totalUsers ? Math.round((stats.completedProfiles / stats.totalUsers) * 100) : 0}%</p>
              <p>• Moyenne crushes/utilisateur: {stats?.completedProfiles ? Math.round((stats.totalCrushes / stats.completedProfiles) * 10) / 10 : 0}</p>
              <p>• Taux d'engagement email: {stats?.totalCrushes ? Math.round((stats.emailsSent / stats.totalCrushes) * 100) : 0}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;