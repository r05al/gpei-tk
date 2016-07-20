class SopArticle < ActiveRecord::Base
  belongs_to :sop_time
  belongs_to :sop_category

  belongs_to :support_affiliation, class_name: 'SupportAffiliation', foreign_key: 'support_affiliation_id'
  belongs_to :responsible_office, class_name: 'ResponsibleOffice', foreign_key: 'responsible_office_id'
  belongs_to :author, class_name: 'User', foreign_key: 'author_id'

  has_many :sop_checklists
  has_many :sop_checklist_sop_articles
  has_many :sop_checklists, :through => :sop_checklist_sop_articles

  has_one :sop_icon

  has_attached_file :reference_link
  has_many :reference_link_articles, as: :reference_linkable
  has_many :reference_links, through: :reference_link_articles

  def to_param
    [id, title.parameterize].join("-")
  end
end