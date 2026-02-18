import { HealthCheckResult, HealthCheckItem } from './types';

export class HealthCheckService {
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks: HealthCheckItem[] = [];
    
    checks.push(await this.checkActiveMaterials());
    checks.push(await this.checkCompleteProcesses());
    checks.push(await this.checkBaseSettings());
    checks.push(await this.checkMinimumTemplates());
    
    const healthy = checks.every(check => check.passed);
    
    return {
      healthy,
      checks,
      timestamp: new Date()
    };
  }

  private async checkActiveMaterials(): Promise<HealthCheckItem> {
    try {
      const materials = await this.getMaterialsWithActivePrice();
      
      if (materials.length === 0) {
        return {
          name: "Active Materials Check",
          passed: false,
          message: "Nenhum material com preço ativo encontrado",
          details: { count: 0 }
        };
      }
      
      return {
        name: "Active Materials Check",
        passed: true,
        message: `Found ${materials.length} materials with active price`,
        details: { count: materials.length }
      };
    } catch (error) {
      return {
        name: "Active Materials Check",
        passed: false,
        message: "Failed to check active materials",
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async checkCompleteProcesses(): Promise<HealthCheckItem> {
    try {
      const processes = await this.getCompleteProcesses();
      
      if (processes.length === 0) {
        return {
          name: "Complete Processes Check",
          passed: false,
          message: "Nenhum processo completo encontrado",
          details: { count: 0 }
        };
      }
      
      return {
        name: "Complete Processes Check",
        passed: true,
        message: `Found ${processes.length} complete processes`,
        details: { count: processes.length }
      };
    } catch (error) {
      return {
        name: "Complete Processes Check",
        passed: false,
        message: "Failed to check complete processes",
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async checkBaseSettings(): Promise<HealthCheckItem> {
    try {
      const settings = await this.getBaseSettings();
      
      const requiredSettings = ['currency', 'taxRate', 'defaultTerms'];
      const missingSettings = requiredSettings.filter(setting => !settings[setting]);
      
      if (missingSettings.length > 0) {
        return {
          name: "Base Settings Check",
          passed: false,
          message: `Configurações base faltantes: ${missingSettings.join(', ')}`,
          details: { missing: missingSettings }
        };
      }
      
      return {
        name: "Base Settings Check",
        passed: true,
        message: "Todas as configurações base estão presentes",
        details: { settings: Object.keys(settings) }
      };
    } catch (error) {
      return {
        name: "Base Settings Check",
        passed: false,
        message: "Failed to check base settings",
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async checkMinimumTemplates(): Promise<HealthCheckItem> {
    try {
      const templates = await this.getMinimumTemplates();
      
      const requiredTemplates = ['basic', 'premium', 'industrial'];
      const availableTemplates = Object.keys(templates);
      const missingTemplates = requiredTemplates.filter(template => !availableTemplates.includes(template));
      
      if (missingTemplates.length > 0) {
        return {
          name: "Minimum Templates Check",
          passed: false,
          message: `Templates mínimos faltantes: ${missingTemplates.join(', ')}`,
          details: { missing: missingTemplates }
        };
      }
      
      return {
        name: "Minimum Templates Check",
        passed: true,
        message: "Todas os templates mínimos estão presentes",
        details: { templates: availableTemplates }
      };
    } catch (error) {
      return {
        name: "Minimum Templates Check",
        passed: false,
        message: "Failed to check minimum templates",
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async getMaterialsWithActivePrice(): Promise<any[]> {
    return [];
  }

  private async getCompleteProcesses(): Promise<any[]> {
    return [];
  }

  private async getBaseSettings(): Promise<any> {
    return {};
  }

  private async getMinimumTemplates(): Promise<any> {
    return {};
  }
}

export const healthCheckService = new HealthCheckService();
