import { Project } from '.prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ProjectDto } from './dto';


@Injectable()
export class ProjectService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(project: ProjectDto): Promise<{project: Project}> {
        const createdProject: Project = await this.prismaService.project.create({ data: { ...project } });
        return { project: createdProject };
    }

    async update(project: ProjectDto, projectId: number): Promise<any> {
        const updatedProject: Project = await this.prismaService.project.update({ data: {...project}, where: { id: projectId } });
        return { project: updatedProject };
    }

    async readById(projectId: number, deleted: boolean): Promise<{project: Project}> {
        let project: Project;
        const projectExist: Project = await this.prismaService.project.findFirst({ where: { id: projectId  } });

        if (!projectExist) {
            return null;
        }
            

        if (deleted) {
            project = await this.prismaService.project.findFirst({ where: { id: projectId, isDeleted: deleted } });
        } else {
            project = await this.prismaService.project.findFirst({ where: { id: projectId } });
        }
  
        return { project };
    }

    async isAuthor(userId: number): Promise<boolean> {  
        const projectExist: Project = await this.prismaService.project.findFirst({ where: { userId } })
        return projectExist ? true : false;
    }

    async readAll(): Promise<{project: Project[]}> {
        const project: Project[] = await this.prismaService.project.findMany({where: {isDeleted: false}});
        return { project };
    }

    async softDelete(projectId: number): Promise<any> {
        const foundProject: Project = await this.prismaService.project.findFirst({where: { id: projectId }});

        if (foundProject && foundProject.isDeleted) {
            await this.prismaService.document.deleteMany({ where: { projectId  } });
            await this.prismaService.guestUserProject.deleteMany({ where: { projectId } });
            return await this.prismaService.project.delete({ where: { id: projectId }});
        }
        await this.prismaService.document.updateMany({ data: { isDeleted: true }, where: { projectId  } });
        return await this.prismaService.project.update({where: { id: projectId }, data: { isDeleted: true }});
    }

}
